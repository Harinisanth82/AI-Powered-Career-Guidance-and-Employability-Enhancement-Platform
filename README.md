# AI-POWERED CAREER GUIDANCE AND EMPLOYABILITY ENHANCEMENT PLATFORM

An enterprise-grade employability engineering and career guidance platform combining **custom domain-specific Machine Learning & NLP** with **targeted API-key Generative AI (LLM)**.

---

## 1. Hybrid AI Architecture

The platform divides intelligence strictly into two functional layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          REACT FRONTEND (Vite SPA)                     │
│  MindEase-inspired modern visual hierarchy · Dark/Light theme persist   │
│  Landing · Auth · Dashboard · Assessments · Roadmaps · Tests · Reports │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NODE / EXPRESS GATEWAY (Port 3000)              │
│  - /api/llm/* routes (Dynamic test & interview question generation)    │
│  - /api/* proxy forwarding to Python FastAPI AI Service                │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
               ▼                                          ▼
┌──────────────────────────────┐        ┌────────────────────────────────┐
│      GENAI LLM SERVICE       │        │   PYTHON FASTAPI AI/ML CORE    │
│  - Google Gen AI SDK         │        │   (Port 5000)                  │
│  - gemini-3.8-flash          │        │  - Scikit-Learn Classifier     │
│  - Online Test Generator     │        │  - Random Forest / LogisticReg │
│  - Dynamic Interview Rounds  │        │  - TF-IDF Cosine Similarity    │
│  - Qualitative LLM Feedback  │        │  - PyMuPDF ATS Resume Parser   │
│  - Automatic Fallback Engine │        │  - Prerequisite Gap Engine     │
└──────────────────────────────┘        │  - Employability 0-100 Model   │
                                        └────────────────────────────────┘
```

---

## 2. Core Functional Pillars

### A. Custom AI/ML & Analytical Core
1. **Multi-Model ML Career Prediction**: Evaluates candidate features against trained classifiers (Logistic Regression, Decision Tree, Random Forest, Gradient Boosting) with real accuracy and F1 metrics.
2. **Deterministic Skill Gap Analysis**: Segregates role competencies into *Mastered*, *Developing*, and *Critical Gaps*, computing estimated preparation hours.
3. **Employability Readiness Index (0–100)**:
   $$\text{Readiness} = (0.35 \times \text{Skills}) + (0.25 \times \text{Roadmap}) + (0.25 \times \text{Proofs}) + (0.15 \times \text{Interviews})$$
4. **Local Resume ATS Parser**: Extracts technical entities using PyMuPDF and regular expressions without sending resumes to external LLMs.
5. **Deterministic Proof of Skills**: Validates GitHub repositories, live URLs, and credentials with verifiable badges.

### B. API-Key LLM Generative Features
1. **Adaptive Online Test Generator**: Generates custom multiple-choice exams for chosen tracks and topics. Scores are calculated deterministically with topic breakdowns and weak area identification.
2. **Interactive AI Interview Simulation**: Real-time turn-by-turn interview simulation with hybrid evaluation (NLP concept coverage + STAR framework checks + qualitative LLM coaching).
3. **Graceful Fallback**: If `GEMINI_API_KEY` is not configured, the system activates pre-compiled high-fidelity question repositories so tests and interviews continue functioning seamlessly.

---

## 3. Environment Configuration

Copy `.env.example` to `.env`:

```env
# Required for Gemini LLM dynamic generation features
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
LLM_API_KEY="YOUR_LLM_API_KEY"

# Base application URL
APP_URL="http://localhost:3000"

# Target URL for the internal Python AI Service
PYTHON_AI_SERVICE_URL="http://127.0.0.1:5000"
```

---

## 4. Getting Started

### Prerequisites
- Node.js >= 20
- Python >= 3.10

### Installation & Launch
```bash
# Install frontend & gateway packages
npm install

# Install Python ML dependencies
pip3 install -r ai-engine/requirements.txt

# Run full-stack dev server (starts Express + Vite on port 3000 and FastAPI on port 5000)
npm run dev
```

Visit `http://localhost:3000` to access the platform.
