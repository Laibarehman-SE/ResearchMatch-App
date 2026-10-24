export interface SampleDataset {
  id: string;
  label: string;
  sublabel: string;
  applicationType: 'Research Internship' | 'MS' | 'PhD';
  tone: 'Formal' | 'Friendly-Professional';
  professorDescription: string;
  cvText: string;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'vision-robotics',
    label: 'Robotics & Vision (Internship)',
    sublabel: 'ETH Zurich — Visual Learning & Perception Lab',
    applicationType: 'Research Internship',
    tone: 'Friendly-Professional',
    professorDescription: `Prof. Dr. Florian Richter
Visual Learning and Autonomous Systems (VLAS) Lab, ETH Zurich
Research Group Focus:
Our group investigates self-supervised visual representation learning and active perception for robotic manipulation in unstructured real-world environments. Recent thrusts include:
1. Contrastive feature learning for sparse multi-view scene graphs without massive batch constraints.
2. Foundation models for zero-shot object affordance reasoning on mobile manipulators.
3. Mitigating distribution shift between synthetic simulation renders (Isaac Gym) and physical Franka Emika Panda arms.
Recent Publications:
- "SparseGrasp: Multi-View Contrastive Representation for 6-DoF Pose-Free Grasping", CVPR 2024.
- "ActiveAfford: Exploring Unseen Objects via Visual Curiosity", ICRA 2024.
Prospective Students / Interns:
We welcome visiting undergraduate and master's researchers for summer and semester internships. Candidates should have solid fundamentals in PyTorch, deep learning, computer vision, and linear algebra. Familiarity with ROS/ROS2, point cloud processing, or robotics simulation is an asset. Strong interest in reproducible empirical research is required.`,
    cvText: `Jane Doe
B.S. in Computer Science (3rd Year), National University of Singapore
GPA: 3.88 / 4.00
Relevant Coursework: Deep Learning (A), Computer Vision (A), Linear Algebra (A), Algorithms (A), Robotics Fundamentals (B+)

Technical Skills:
- Languages: Python, C++, Java, SQL, Bash
- Frameworks & Libraries: PyTorch, TorchVision, OpenCV, NumPy, SciPy, Matplotlib, Weights & Biases
- Tools: Git, Docker, Linux, Isaac Sim (beginner)

Research & Engineering Experience:
1. Undergraduate Research Assistant — NUS Vision & Sensing Lab (Aug 2023 - Present)
   - Developed a self-supervised contrastive learning pipeline for fine-grained defect segmentation in agricultural drone imagery using PyTorch and TorchVision.
   - Evaluated momentum encoders (MoCo v3) against SimCLR; reduced required batch size from 512 to 64 while maintaining 82.4% mIoU.
   - Authored code repository adhering to clean reproducible standards with automated benchmarking tests.

2. Course Project: 3D Point Cloud Object Classifier (Spring 2023)
   - Implemented PointNet from scratch in PyTorch to classify objects from the ModelNet40 benchmark dataset, achieving 88.5% accuracy.
   - Explored data augmentation strategies (random jitter, point dropout, arbitrary 3D rotation) to bolster rotational invariance.

Honors & Activities:
- Dean's List for Academic Excellence (Fall 2022, Spring 2023)
- Vice President, University Robotics Club (Organized university-wide autonomous rover challenge)`
  },
  {
    id: 'nlp-alignment',
    label: 'NLP & AI Alignment (PhD)',
    sublabel: 'University of Toronto / Vector Institute — Language Lab',
    applicationType: 'PhD',
    tone: 'Formal',
    professorDescription: `Prof. Alistair Sterling
Computational Linguistics & Model Alignment Group
Department of Computer Science, University of Toronto & Vector Institute

Research Statement:
Our laboratory studies the mechanisms governing reasoning, factuality, and safety alignment in large language models. Key thematic questions include:
- Mechanistic Interpretability: Identifying circuit representations and linear probing of causal knowledge within transformer attention heads.
- Preference Optimization & Truthfulness: Moving beyond standard RLHF/DPO by formulating preference dynamics resistant to sycophancy and reward hacking.
- Scalable Oversight: Evaluating whether smaller critique models can audit superhuman mathematical reasoning traces.

Recent Works:
- "Probing Fact-Tracing Circuits in Autoregressive Decoders", NeurIPS 2024 (Oral).
- "Direct Preference Alignment Under Perturbed Latent Truth", ACL 2024.

Prospective Graduate Applicants:
I am actively seeking 2 fully funded PhD students for Fall admission. Ideal applicants demonstrate rigorous mathematical maturity (probability, linear algebra, optimization), extensive experience auditing or fine-tuning transformer architectures (Hugging Face Transformers, PyTorch, vLLM, DeepSpeed), and demonstrable passion for interpretability or empirical alignment benchmarks.`,
    cvText: `Marcus Thorne
M.S. in Computer Science, Georgia Institute of Technology (Expected May 2025)
B.S. in Mathematics and Computer Science, Univ. of Washington (GPA: 3.92 / 4.00)

Technical Skills:
- Languages: Python, C++, Julia
- ML Tools: PyTorch, Hugging Face (Transformers, PEFT, TRL), DeepSpeed, vLLM, WandB, PyTorch Lightning
- Mathematical Background: Real Analysis, Measure-Theoretic Probability, Convex Optimization, Information Theory

Research Experience:
1. Graduate Research Assistant — Machine Learning Center at Georgia Tech (Jan 2024 - Present)
   - Researched internal representation dynamics during step-by-step reasoning on the GSM8k and MATH datasets using Llama-3-8B and Mistral-7B.
   - Applied linear probe classifiers and activation patching to intermediate residual streams to track truth token propagation across hidden layers.
   - Discovered that reward collapse in DPO often correlates with suppression of early attention heads responsible for fact retrieval.
   - First-author submission currently under review for ICLR 2025.

2. Undergraduate Thesis Researcher — UW NLP Lab (Sep 2022 - June 2023)
   - Investigated parameter-efficient fine-tuning (LoRA, DoRA) stability on constrained downstream QA tasks.
   - Implemented distributed evaluation scripts across 4x A100 GPU nodes.

Publications:
- M. Thorne, et al. "Latent Truth Probing in Mid-Sized Decoders: An Empirical Study", Workshop on Representation Engineering, ICML 2024.`
  },
  {
    id: 'comp-bio',
    label: 'Computational Biology (MS)',
    sublabel: 'MIT / Broad Institute — Genomic Data Science Lab',
    applicationType: 'MS',
    tone: 'Formal',
    professorDescription: `Prof. Sarah Lin, Ph.D.
Laboratory for Computational Genomics and Cellular Machine Learning
Department of Biology & EECS, MIT / Core Faculty Member at Broad Institute

Overview:
We develop scalable computational and statistical algorithms to decode single-cell multi-omics data, spatial transcriptomics, and variant-to-function maps in autoimmune diseases.
Areas of Focus:
1. Deep generative models (VAEs, diffusion models) for single-cell perturbation prediction and cell-state manifold reconstruction.
2. Integrating spatial transcriptomics with histology images for microenvironment cell-cell communication inference.
3. Graph neural networks for gene regulatory network (GRN) discovery.

Prospective Master's / Postgraduate Trainees:
Our lab welcomes master's thesis students with strong quantitative foundations (Computer Science, Statistics, or Computational Biology). We seek students comfortable with Python (Scanpy, PyTorch, PyG), standard bioinformatic tools (Bioconductor, AnnData), and statistical hypothesis testing who are eager to work at the intersection of biological data and modern machine learning.`,
    cvText: `Liam Chen
B.S. in Biomedical Engineering, Minor in Data Science, Johns Hopkins University (GPA: 3.84 / 4.00)

Technical Skills:
- Languages & Tools: Python, R, Bash, Nextflow, Git
- Bioinformatic & ML Libraries: PyTorch, PyTorch Geometric, Scanpy, AnnData, Seurat, Bioconductor, Scikit-learn
- Domain Knowledge: Single-cell RNA-seq pipelines, Gene expression normalization, Spatial transcriptomics basics, Batch correction (Harmony, scVI)

Research Experience:
1. Student Researcher — JHU Computational Medicine Institute (June 2023 - Present)
   - Preprocessed and analyzed single-cell RNA sequencing datasets (>120,000 cells) across lupus patient cohorts using Scanpy and Seurat.
   - Benchmarked batch-effect correction methods (scVI vs. Harmony); improved cell-type clustering consistency by 18% as measured by silhouette score.
   - Built a custom Python pipeline for differential gene expression analysis and pathway enrichment visualization.

2. Bioinformatics Intern — GeneTech Analytics (Summer 2022)
   - Automated quality control reports for Illumina next-generation sequencing runs using FastQC and MultiQC within a Snakemake workflow.
   - Assisted senior bioinformaticians in generating variant calling files (VCF) and annotating oncogenic mutations.

Coursework:
Genomic Data Science (A), Applied Machine Learning (A), Statistical Genomics (A-), Molecular Biology (A), Linear Algebra (A)`
  }
];
