import { ResearchPackage, ApplicationType, ToneType } from '../types';

export function generateMarkdownReport(
  pkg: ResearchPackage,
  metadata: {
    applicationType: ApplicationType;
    tone: ToneType;
    professorExcerpt?: string;
    candidateName?: string;
  }
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `# ResearchMatch Academic Application Dossier
*Generated on ${dateStr}*
**Target Level:** ${metadata.applicationType} | **Tone:** ${metadata.tone}
${metadata.candidateName ? `**Applicant:** ${metadata.candidateName}\n` : ''}

---

## 1. Fit Analysis & Admission Synergy
- **Fit Score:** ${pkg.fitAnalysis.score.toFixed(1)} / 10.0
- **Assessment Verdict:** ${pkg.fitAnalysis.oneLineReason}

### Matching Skills & Synergies
${pkg.fitAnalysis.matchingSkills.map((s) => `- ✅ ${s}`).join('\n')}

### Missing or Lab-Specific Prerequisites
${pkg.fitAnalysis.missingSkills.map((s) => `- ⚠️ ${s}`).join('\n')}

---

## 2. Cold Outreach Email
**Subject:** ${pkg.coldEmail.subject}
**Word Count:** ~${pkg.coldEmail.wordCount} words (Strictly under 150 words)
**Referenced Lab Work:** ${pkg.coldEmail.professorDetailReferenced}
**Connected Student Strengths:** ${pkg.coldEmail.studentSkillsConnected.join(', ')}

\`\`\`text
${pkg.coldEmail.body}
\`\`\`

---

## 3. Statement of Purpose (SOP) Outline
${pkg.sopOutline.sections
  .map(
    (sec, i) => `### §${i + 1}. ${sec.title}
${sec.bullets.map((b) => `- ${b}`).join('\n')}`
  )
  .join('\n\n')}

---

## 4. Targeted Skill Gaps & Action Plan
${pkg.skillGaps
  .map(
    (gap, i) => `### [${i + 1}] ${gap.skill}
**Action Plan:** ${gap.practicalAction}`
  )
  .join('\n\n')}

---

## 5. Potential Faculty Interview Inquiries
${pkg.interviewQuestions
  .map(
    (q, i) => `### Q${i + 1}: ${q.question}
💡 **Answering Strategy:** ${q.tip}`
  )
  .join('\n\n')}

---

## 6. Pre-Submission Action Checklist
${pkg.actionChecklist.map((step, i) => `- [ ] Checkpoint 0${i + 1}: ${step}`).join('\n')}

---
*Published via ResearchMatch — Academic Editorial Application Suite*
`;
}

export function downloadMarkdownFile(content: string, filename: string = 'ResearchMatch_Application_Dossier.md') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printApplicationPackageAsPdf(
  pkg: ResearchPackage,
  metadata: {
    applicationType: ApplicationType;
    tone: ToneType;
    candidateName?: string;
    labName?: string;
  }
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ResearchMatch Dossier — ${metadata.labName || 'Application Package'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      font-family: 'Inter', sans-serif;
      color: #141413;
      background: #FFFFFF;
      line-height: 1.5;
      font-size: 10pt;
    }
    h1, h2, h3, .serif {
      font-family: 'Fraunces', serif;
    }
    .header-rule {
      border-bottom: 2px solid #1F5F4A;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .stamp {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      border: 1.5px dashed #1F5F4A;
      color: #1F5F4A;
      background: #EBF3EF;
      padding: 3px 8px;
      font-size: 9pt;
      text-transform: uppercase;
    }
    .card {
      border: 1px solid #E6DFD5;
      background: #FAF7F2;
      padding: 12px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 13pt;
      color: #1F5F4A;
      border-bottom: 1px solid #E6DFD5;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 10px;
    }
    .email-box {
      background: #FFFFFF;
      border: 1px solid #D4CABF;
      padding: 14px;
      font-size: 9.5pt;
      white-space: pre-wrap;
      line-height: 1.6;
    }
    .two-col {
      display: flex;
      gap: 12px;
    }
    .col {
      flex: 1;
    }
    .badge {
      display: inline-block;
      background: #FFFFFF;
      border: 1px solid #D4CABF;
      padding: 2px 6px;
      font-size: 8.5pt;
      margin: 2px;
    }
    .bullet-item {
      margin-bottom: 4px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header-rule">
    <div style="display: flex; justify-content: space-between; align-items: baseline;">
      <div>
        <h1 style="margin: 0; font-size: 20pt; color: #141413;">ResearchMatch <span style="font-weight: normal; font-style: italic; color: #1F5F4A;">Dossier</span></h1>
        <div style="font-size: 9pt; color: #6B665E; margin-top: 2px;">Faculty Research Application Package • ${dateStr}</div>
      </div>
      <div style="text-align: right;">
        <div class="stamp">SCORE: ${pkg.fitAnalysis.score.toFixed(1)} / 10</div>
        <div style="font-size: 8.5pt; color: #6B665E; margin-top: 3px;">Target: ${metadata.applicationType}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div style="font-weight: 700; margin-bottom: 4px; color: #1F5F4A;">Executive Admission Fit</div>
    <div>${pkg.fitAnalysis.oneLineReason}</div>
    <div class="two-col" style="margin-top: 10px;">
      <div class="col">
        <div style="font-size: 8.5pt; font-weight: 700; color: #1F5F4A; text-transform: uppercase;">Matching Strengths:</div>
        <div>${pkg.fitAnalysis.matchingSkills.map(s => `<span class="badge">✓ ${s}</span>`).join('')}</div>
      </div>
      <div class="col">
        <div style="font-size: 8.5pt; font-weight: 700; color: #9E782F; text-transform: uppercase;">Missing / Lab Thrusts:</div>
        <div>${pkg.fitAnalysis.missingSkills.map(s => `<span class="badge">• ${s}</span>`).join('')}</div>
      </div>
    </div>
  </div>

  <div class="section-title serif">I. Personalized Cold Outreach Email</div>
  <div style="font-size: 9pt; font-weight: 600; margin-bottom: 6px;">Subject: ${pkg.coldEmail.subject}</div>
  <div class="email-box">${pkg.coldEmail.body}</div>
  <div style="font-size: 8pt; color: #6B665E; margin-top: 4px;">Referenced Lab Work: ${pkg.coldEmail.professorDetailReferenced} | ~${pkg.coldEmail.wordCount} words</div>

  <div style="page-break-before: always;"></div>

  <div class="section-title serif">II. Statement of Purpose (SOP) Outline</div>
  ${pkg.sopOutline.sections.map((sec, i) => `
    <div style="margin-bottom: 10px;">
      <div style="font-weight: 700; color: #1F5F4A; font-size: 9.5pt;">§ 0${i + 1}. ${sec.title}</div>
      <ul style="margin: 4px 0 0 16px; padding: 0;">
        ${sec.bullets.map(b => `<li class="bullet-item" style="font-size: 9pt;">${b}</li>`).join('')}
      </ul>
    </div>
  `).join('')}

  <div class="section-title serif">III. Targeted Skill Gaps & Remediation Plan</div>
  ${pkg.skillGaps.map((g, i) => `
    <div style="margin-bottom: 8px; font-size: 9pt;">
      <strong>[${i + 1}] ${g.skill}</strong> — <span style="color: #2C2B29;">${g.practicalAction}</span>
    </div>
  `).join('')}

  <div class="section-title serif">IV. Anticipated Interview Inquiries & Tips</div>
  ${pkg.interviewQuestions.map((q, i) => `
    <div style="margin-bottom: 8px; font-size: 9pt;">
      <div style="font-weight: 600;">Q${i + 1}: ${q.question}</div>
      <div style="color: #1F5F4A; font-size: 8.5pt; margin-left: 12px;">Strategy: ${q.tip}</div>
    </div>
  `).join('')}

  <div class="section-title serif">V. Pre-Submission Action Checklist</div>
  <ul style="margin: 4px 0 0 16px; padding: 0;">
    ${pkg.actionChecklist.map((c, i) => `<li style="font-size: 9pt; margin-bottom: 4px;">[ ] Checkpoint 0${i + 1}: ${c}</li>`).join('')}
  </ul>

  <div style="margin-top: 25px; padding-top: 10px; border-top: 1px solid #E6DFD5; font-size: 8pt; color: #6B665E; text-align: center;">
    ResearchMatch Academic Dossier • Strict anti-hallucination verification • Powered by Gemini
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}
