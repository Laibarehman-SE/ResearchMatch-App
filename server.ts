import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI SDK (Server-Side)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are ResearchMatch, an expert academic advisor for students applying to foreign research internships, MS, and PhD programs. Return ONLY valid JSON matching the schema, with no extra text.
Rules:
- Never invent skills, projects, publications, grades, or experience that are not in the CV.
- Only mention professor/lab details that appear in the provided text.
- Keep language professional, clear, concise, and academically authentic.
- For cold outreach: body strictly under 150 words.
- For follow-ups: body strictly under 100 words, courteous and professional.
- For SOP outline: 5 sections with exactly 2 focused bullet points each.
- For Skill Gaps: up to 5 skills with practical courses, papers, or mini-projects.
- For Interview Questions: 6 probing questions with tactical advice.
- For Action Checklist: 5 pre-submission checkpoints.
- If input is inadequate, return a helpful error field.`;

// Candidate models for automatic retry & fallback
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];

interface GeminiCallOptions {
  contents: any;
  systemInstruction?: string;
  responseSchema?: any;
  temperature?: number;
  useFallbackModel?: boolean;
}

/**
 * Executes a Gemini API call with automatic retries on 503/429/transient errors
 * with 2-5 second delay. If primary model fails after retries, automatically
 * tries available fallback Gemini models.
 */
async function callGeminiWithRetryAndFallback(options: GeminiCallOptions): Promise<string> {
  const modelsToTry = options.useFallbackModel
    ? [...FALLBACK_MODELS, PRIMARY_MODEL]
    : [PRIMARY_MODEL, ...FALLBACK_MODELS];

  let lastError: any = null;

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const currentModel = modelsToTry[mIdx];

    // Retry up to 3 times on this model
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[Gemini] Calling ${currentModel} (attempt ${attempt}/3)...`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction || SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: options.responseSchema,
            temperature: options.temperature ?? 0.2,
          },
        });

        const text = response.text;
        if (!text || text.trim().length === 0) {
          throw new Error('Gemini returned an empty response.');
        }

        return text;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err).toLowerCase();
        const isTransient =
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('resource_exhausted') ||
          msg.includes('unavailable') ||
          msg.includes('overloaded') ||
          msg.includes('high demand') ||
          msg.includes('busy');

        console.warn(`[Gemini] Attempt ${attempt}/3 failed on ${currentModel}: ${err?.message || err}`);

        if (isTransient && attempt < 3) {
          // 2 to 5 second backoff
          const delayMs = attempt === 1 ? 2200 : attempt === 2 ? 3500 : 5000;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        // Exhausted attempts on this model, switch to next model
        break;
      }
    }

    console.warn(`[Gemini] Switching to fallback model after exhausting attempts on ${currentModel}...`);
  }

  throw lastError || new Error('The AI model is currently busy. Please retry shortly.');
}

function formatServerErrorMessage(err: unknown): string {
  const str = String((err as any)?.message || err).toLowerCase();
  if (str.includes('429') || str.includes('resource_exhausted') || str.includes('quota') || str.includes('rate limit')) {
    return 'The AI service is experiencing high traffic right now. We automatically retried, but servers remain busy. Please try again in a moment.';
  }
  if (str.includes('503') || str.includes('unavailable') || str.includes('overloaded') || str.includes('busy')) {
    return 'The research matching model is momentarily busy. Please try again in a few seconds.';
  }
  if (str.includes('api key') || str.includes('unauthenticated')) {
    return 'Service credentials could not be verified. Please check your Gemini API key.';
  }
  return (err as any)?.message || 'An unexpected issue occurred while evaluating the research profile.';
}

// 1. Full Analysis Schema
const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    error: {
      type: Type.STRING,
      description: 'Error message if input text is too short or invalid, otherwise empty string.',
    },
    fitAnalysis: {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.NUMBER,
          description: 'Fit score between 1.0 and 10.0 based on real synergy between student CV and professor page.',
        },
        oneLineReason: {
          type: Type.STRING,
          description: 'A single concise sentence explaining the reason for the fit score.',
        },
        matchingSkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Skills and methods found in both the CV and the professor/program description.',
        },
        missingSkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Skills or prerequisites emphasized in the lab description not evident in the CV.',
        },
      },
      required: ['score', 'oneLineReason', 'matchingSkills', 'missingSkills'],
    },
    coldEmail: {
      type: Type.OBJECT,
      properties: {
        subject: {
          type: Type.STRING,
          description: 'High-impact subject line tailored to the application type and lab research topic.',
        },
        body: {
          type: Type.STRING,
          description: 'Body of the cold email, strictly under 150 words. Professional and focused.',
        },
        wordCount: {
          type: Type.INTEGER,
          description: 'Actual word count of the body text (must be under 150).',
        },
        professorDetailReferenced: {
          type: Type.STRING,
          description: 'The specific project, paper, or direction referenced directly from the professor description.',
        },
        studentSkillsConnected: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'The actual skills or projects from the student CV connected to the professor work.',
        },
      },
      required: ['subject', 'body', 'wordCount', 'professorDetailReferenced', 'studentSkillsConnected'],
    },
    sopOutline: {
      type: Type.OBJECT,
      properties: {
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Section title: Introduction, Academic Background, Why This Lab, Research Goals, or Conclusion.',
              },
              bullets: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly two high-yield bullet points tailored to this applicant and lab.',
              },
            },
            required: ['title', 'bullets'],
          },
        },
      },
      required: ['sections'],
    },
    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: {
            type: Type.STRING,
            description: 'Name of the missing skill or domain gap (up to 5 total).',
          },
          practicalAction: {
            type: Type.STRING,
            description: 'Actionable remedy: a specific open-source course, seminal paper, or mini-project.',
          },
        },
        required: ['skill', 'practicalAction'],
      },
    },
    interviewQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: 'A probing technical or motivation question the professor is likely to ask (6 total).',
          },
          tip: {
            type: Type.STRING,
            description: 'Tactical advice for the student on how to frame an authentic answer using their CV experience.',
          },
        },
        required: ['question', 'tip'],
      },
    },
    actionChecklist: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Exactly 5 tactical next steps before sending out the application.',
    },
  },
  required: ['fitAnalysis', 'coldEmail', 'sopOutline', 'skillGaps', 'interviewQuestions', 'actionChecklist'],
};

// 2. Email Regeneration Schema
const emailRegenerateSchema = {
  type: Type.OBJECT,
  properties: {
    coldEmail: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING },
        body: { type: Type.STRING },
        wordCount: { type: Type.INTEGER },
        professorDetailReferenced: { type: Type.STRING },
        studentSkillsConnected: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['subject', 'body', 'wordCount', 'professorDetailReferenced', 'studentSkillsConnected'],
    },
  },
  required: ['coldEmail'],
};

// 3. CV Analysis Schema (Profile Card & CV Strength with graduationYear)
const cvAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    error: {
      type: Type.STRING,
      description: 'Error if CV is empty or unreadable.',
    },
    profile: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Student or applicant full name' },
        education: {
          type: Type.OBJECT,
          properties: {
            degree: { type: Type.STRING },
            institution: { type: Type.STRING },
            graduationYear: { type: Type.STRING, description: 'Expected or completed graduation year (e.g. 2025). If not mentioned, return empty string.' },
            gpaOrHonors: { type: Type.STRING, description: 'GPA or academic honors. If not mentioned, return empty string.' },
          },
          required: ['degree', 'institution'],
        },
        topSkills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: 'e.g., Core Languages, Machine Learning, Laboratory Techniques' },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['category', 'skills'],
          },
        },
        keyProjects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING, description: 'Concise 1-2 sentence description based strictly on the CV' },
            },
            required: ['title', 'description'],
          },
        },
        cvStrengthScore: {
          type: Type.NUMBER,
          description: 'Overall CV strength score out of 10.0 for academic research opportunities',
        },
        improvementTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Exactly 3 actionable, high-impact tips to improve the CV for international lab applications.',
        },
      },
      required: ['name', 'education', 'topSkills', 'keyProjects', 'cvStrengthScore', 'improvementTips'],
    },
  },
  required: ['profile'],
};

// 4. Lab Ranker Schema
const labRankerSchema = {
  type: Type.OBJECT,
  properties: {
    rankedLabs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          labId: { type: Type.STRING },
          rank: { type: Type.INTEGER },
          title: { type: Type.STRING },
          fitScore: { type: Type.NUMBER },
          shortReason: { type: Type.STRING },
          topSynergies: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyMissingAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendationVerdict: { type: Type.STRING, description: 'e.g., "Top Academic Match", "Strong Contender", "High-Reach Target"' },
        },
        required: ['labId', 'rank', 'title', 'fitScore', 'shortReason', 'topSynergies', 'keyMissingAreas', 'recommendationVerdict'],
      },
    },
    summaryAdvice: {
      type: Type.STRING,
      description: 'Strategic advice on how the student should prioritize their outreach across these labs.',
    },
  },
  required: ['rankedLabs', 'summaryAdvice'],
};

// 5. Follow-up Email Schema
const followUpEmailSchema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    body: { type: Type.STRING, description: 'Polite, brief follow-up email strictly under 100 words.' },
    daysRecommendation: { type: Type.STRING, description: 'e.g., "Send 7-10 days after the initial inquiry"' },
    strategyNote: { type: Type.STRING, description: 'Professional advice if still unread or no reply.' },
  },
  required: ['subject', 'body', 'daysRecommendation', 'strategyNote'],
};

// ROUTE: Full Analysis
app.post('/api/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { professorDescription, cvText, applicationType = 'Research Internship', tone = 'Formal', useFallbackModel = false } = req.body;

    if (!professorDescription || !cvText) {
      res.status(400).json({
        error: 'Both "Professor / Program Description" and "Your CV / Skills" are required.',
      });
      return;
    }

    if (professorDescription.trim().length < 20 || cvText.trim().length < 20) {
      res.status(400).json({
        error: 'Please provide more details in both text areas (at least a couple of sentences) to generate an accurate analysis.',
      });
      return;
    }

    const prompt = `Analyze this research application pairing:
Application Type: ${applicationType}
Desired Tone: ${tone}

--- PROFESSOR / PROGRAM DESCRIPTION ---
${professorDescription.trim()}

--- STUDENT CV / SKILLS ---
${cvText.trim()}

Execute the comprehensive evaluation according to your system instructions.`;

    const text = await callGeminiWithRetryAndFallback({
      contents: prompt,
      responseSchema: analysisResponseSchema,
      temperature: 0.2,
      useFallbackModel,
    });

    const parsed = JSON.parse(text);

    if (parsed.error && parsed.error.trim().length > 0) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    res.json(parsed);
  } catch (err: unknown) {
    console.error('Error analyzing application:', err);
    res.status(503).json({ error: formatServerErrorMessage(err) });
  }
});

// ROUTE: Regenerate Cold Email
app.post('/api/regenerate-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { professorDescription, cvText, applicationType = 'Research Internship', tone = 'Formal', variation = 'standard', useFallbackModel = false } = req.body;

    if (!professorDescription || !cvText) {
      res.status(400).json({ error: 'Both Professor Description and CV text are required.' });
      return;
    }

    const prompt = `Regenerate a tailored cold email for this candidate:
Application Type: ${applicationType}
Tone: ${tone}
Variation focus: ${variation} (ensure high clarity, distinct angle, and strictly under 150 words)

--- PROFESSOR / PROGRAM DESCRIPTION ---
${professorDescription.trim()}

--- STUDENT CV / SKILLS ---
${cvText.trim()}`;

    const text = await callGeminiWithRetryAndFallback({
      contents: prompt,
      responseSchema: emailRegenerateSchema,
      temperature: 0.5,
      useFallbackModel,
    });

    const parsed = JSON.parse(text);
    res.json(parsed.coldEmail);
  } catch (err: unknown) {
    console.error('Error regenerating email:', err);
    res.status(503).json({ error: formatServerErrorMessage(err) });
  }
});

// ROUTE: Parse & Analyze CV Overview (Profile Card & CV Strength Score)
app.post('/api/analyze-cv', async (req: Request, res: Response): Promise<void> => {
  try {
    const { cvText, pdfBase64, filename, useFallbackModel = false } = req.body;

    if (!cvText && !pdfBase64) {
      res.status(400).json({ error: 'Please provide either CV text or an uploaded PDF file.' });
      return;
    }

    let contents: any;

    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this student CV thoroughly. Extract the applicant's name, education (degree, institution, graduationYear if present, and gpaOrHonors if present), top skills (categorized), and key projects. If graduationYear or GPA is missing, return empty string for that field (do not output "Not specified"). Calculate a CV Strength Score out of 10.0 for academic research applications, and provide exactly 3 concrete improvement tips.`,
          },
        ],
      };
    } else {
      if (cvText.trim().length < 25) {
        res.status(400).json({ error: 'CV text is too brief. Please provide a more detailed CV.' });
        return;
      }
      contents = `Analyze this student CV thoroughly. Extract the applicant's name, education (degree, institution, graduationYear if present, and gpaOrHonors if present), top skills (categorized), and key projects. If graduationYear or GPA is missing, return empty string for that field (do not output "Not specified"). Calculate a CV Strength Score out of 10.0 for international academic research opportunities (internships, MS, PhD), and provide exactly 3 concrete improvement tips.
      
--- STUDENT CV ---
${cvText.trim()}`;
    }

    const text = await callGeminiWithRetryAndFallback({
      contents,
      responseSchema: cvAnalysisSchema,
      temperature: 0.2,
      useFallbackModel,
    });

    const parsed = JSON.parse(text);
    if (parsed.error && parsed.error.trim().length > 0) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    res.json(parsed.profile);
  } catch (err: unknown) {
    console.error('Error analyzing CV:', err);
    res.status(503).json({ error: formatServerErrorMessage(err) });
  }
});

// ROUTE: Lab Ranker (Compare up to 3 labs)
app.post('/api/rank-labs', async (req: Request, res: Response): Promise<void> => {
  try {
    const { cvText, labs, applicationType = 'Research Internship', useFallbackModel = false } = req.body;

    if (!cvText || cvText.trim().length < 20) {
      res.status(400).json({ error: 'A student CV is required to rank target labs.' });
      return;
    }

    if (!Array.isArray(labs) || labs.length < 2) {
      res.status(400).json({ error: 'Please provide at least 2 labs (up to 3) to rank.' });
      return;
    }

    const formattedLabs = labs
      .map(
        (l: { id: string; label: string; text: string }, i: number) =>
          `=== LAB ${i + 1} (ID: ${l.id}, Label: "${l.label}") ===\n${l.text.trim()}`
      )
      .join('\n\n');

    const prompt = `Rank these target labs for a student applying for ${applicationType}.

--- STUDENT CV ---
${cvText.trim()}

--- TARGET LABS TO RANK ---
${formattedLabs}

Evaluate each lab's exact alignment with the student's verified skills and project track record. Rank them strictly from #1 (Highest synergy) to #${labs.length}. Ensure fit scores out of 10.0 reflect genuine overlap, provide concise reasons, top synergies, and key missing prerequisites.`;

    const text = await callGeminiWithRetryAndFallback({
      contents: prompt,
      responseSchema: labRankerSchema,
      temperature: 0.2,
      useFallbackModel,
    });

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: unknown) {
    console.error('Error ranking labs:', err);
    res.status(503).json({ error: formatServerErrorMessage(err) });
  }
});

// ROUTE: Polite Follow-up Email Generation
app.post('/api/followup-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { professorDescription, cvText, initialSubject, studentName, daysAgo = 8, useFallbackModel = false } = req.body;

    const prompt = `Draft a polite, academic follow-up email to a professor who has not replied to an initial research inquiry sent ${daysAgo} days ago.
Initial Subject: "${initialSubject || 'Prospective Research Inquiry'}"
Applicant Name: ${studentName || 'Student'}

--- PROFESSOR / LAB CONTEXT ---
${(professorDescription || '').slice(0, 800)}

--- STUDENT CV CONTEXT ---
${(cvText || '').slice(0, 800)}

Rules:
- Strictly under 100 words.
- Tone: Humble, polite, professional, acknowledging the professor's busy schedule.
- Briefly restate strong mutual interest referencing the lab's core topic without repeating the whole initial email.
- Ask politely if they had a chance to consider the inquiry or if they anticipate openings in their group.`;

    const text = await callGeminiWithRetryAndFallback({
      contents: prompt,
      responseSchema: followUpEmailSchema,
      temperature: 0.3,
      useFallbackModel,
    });

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: unknown) {
    console.error('Error generating follow-up email:', err);
    res.status(503).json({ error: formatServerErrorMessage(err) });
  }
});

// Production vs Dev Vite handler
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`ResearchMatch server running on http://0.0.0.0:${PORT}`);
});
