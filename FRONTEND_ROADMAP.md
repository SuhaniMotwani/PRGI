# PRGI TitleGuard 3D • Front-End Development Roadmap
**Smart India Hackathon • Problem Statement PSS06: Automated Press Title Verification & Agentic Generation**

---

## 1. Executive Summary & Problem Context

The **Press Registrar General of India (PRGI)** is tasked with verifying every new periodical/newspaper title submission against **160,000+ existing registered titles** under the *Press and Registration of Periodicals Act, 2023*.

### The Bottleneck:
- **High Cost of Rejection:** Every manual rejection costs applicants **₹1,000 in government fees** and **25 to 30 days of blocking delays**.
- **Limitations of Basic Search:** Simple keyword matching fails against:
  1. **Reordered Words / Anagrams** (e.g., *Times India* vs *India Times*)
  2. **Phonetic Spelling Variants** (e.g., *Jagran* vs *Jaagran*)
  3. **Multilingual Semantic Translations** (e.g., *Daily News* vs *Dainik Samachar*, *Vivah Suchi* vs *Matrimonial List*)
  4. **Prefix/Suffix Additions & Core-Word Overlaps** (e.g., *The Vidarbha Daily Express* vs *Vidarbha Patrika*)
  5. **Banned Government Rules** (Emblems Act, Commercial terms, URLs, Generic single root words).

---

## 2. 3-Layer System Architecture & 6-Member Work Division

```mermaid
graph TD
    subgraph Layer 3 — Application & Agents
        M6["Member 6: Frontend & 3D Dashboard (Next.js / Vite / Three.js)"]
        M1["Member 1: FastAPI Orchestrator (/verify-title)"]
        M5["Member 5: Agentic Workflow (Interviewer → Gen → Verifier → Ranker)"]
    end

    subgraph Layer 2 — AI/ML & Rules
        M2["Member 2: NLP/ML Similarity Engine (4-D Similarity)"]
        M4["Member 4: Deterministic Rules & RAG Explainability (PRGI 2025)"]
    end

    subgraph Layer 1 — Data & Candidate Search
        M3["Member 3: Database & pgvector Search (160k Titles)"]
    end

    M6 <--> M1
    M1 <--> M3
    M1 <--> M2
    M1 <--> M4
    M5 <--> M1
```

| Member | Layer | Role | Core Deliverable |
| :--- | :--- | :--- | :--- |
| **Member 1** | Layer 3 | **Backend + System Integration** | FastAPI gateway, orchestration pipeline `/verify-title`, error handling, Docker |
| **Member 2** | Layer 2 | **NLP / ML Engineer** | Language detection, transliteration, 4-D similarity calculations |
| **Member 3** | Layer 1 | **Database & Search Engineer** | 160,000 master CSV ingestion, PostgreSQL + pgvector, top-K search `/search/candidates` |
| **Member 4** | Layer 2 | **Rules + RAG + Explainability** | Deterministic government checks (Emblems Act, Rule 4.1a commercial ban), legal citations |
| **Member 5** | Layer 3 | **Agentic Title Generator** | 4-Agent pipeline (Interviewer → Generator → Verifier → Ranker) |
| **Member 6** | Layer 3 | **Frontend + 3D UI + QA** | Interactive 3D verification console, transliteration preview, officer copilot, demo QA |

---

## 3. The 5-Stage Verification Funnel in the Frontend

1. **Stage 1: Clean & Script Normalization**
   - Strips non-alphanumerics, detects Indic scripts (Devanagari, Bengali, Tamil, Telugu, Gujarati, Urdu), and renders real-time Roman transliterated phonetic representations.
2. **Stage 2: Shortlist Candidate Retrieval**
   - Fast filtering across 160,000 records down to top ~200 suspects using word, sound, and concept matching.
3. **Stage 3: 4-Dimensional Deep Scoring**
   - **Lexical Score (0-100%):** Levenshtein & Token Sort Anagram detection.
   - **Phonetic Score (0-100%):** Soundex/Metaphone sound-alike matching.
   - **Semantic Score (0-100%):** Cross-lingual translation vector embeddings.
   - **Core-Word Score (0-100%):** Strips media filler words (*The, Daily, Patrika, News, Times, Samachar*) to detect primary root collisions.
4. **Stage 4: Deterministic Government Rulebook Check**
   - Strict audit of PRGI 2025 statutory guidelines:
     - `Rule 1.1a`: Single generic dictionary root word ban
     - `Rule 2.1a`: UN, Government & National Emblem protected names
     - `Rule 3.2b`: Internet domains, URLs, and web syntax ban
     - `Rule 4.1a`: Purely commercial, advertising & matrimonial catalog ban
     - `Rule 6.1b`: Defamatory and public order compliance
     - `Rule 7.2a`: Character length compliance (3 - 100 chars)
5. **Stage 5: Traffic Light Verdict & Grounded Explanation**
   - **APPROVED (Green):** Low risk score, clear for Aadhaar e-sign filing.
   - **MANUAL REVIEW (Amber):** Borderline similarity requiring District Magistrate / PRGI officer discretion.
   - **REJECTED (Red):** Severe collision or statutory rule violation with cited clauses.

---

## 4. Front-End Features & Component Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Hero3DCanvas.tsx        # Interactive Three.js 3D Hologram Cylinder & Laser Scanner
│   │   │   └── ParticleBackground.tsx  # Ambient 3D Particle Constellation System
│   │   ├── common/
│   │   │   ├── Header.tsx              # Govt Portal ribbon, status indicators, audio toggle, API switch
│   │   │   └── Footer.tsx              # PRGI Act 2023 citations & metadata
│   │   ├── verifier/
│   │   │   └── VerificationView.tsx    # Live 5-stage verification console, 4-D meters, clashing records table
│   │   ├── agents/
│   │   │   └── AgenticStudio.tsx       # Member 5 multi-agent loop with pre-screened approved titles
│   │   ├── officer/
│   │   │   └── OfficerDashboard.tsx    # Risk-sorted officer queue & AI Copilot Decision Note drafter
│   │   ├── registry/
│   │   │   └── RegistryExplorer.tsx    # Master dataset explorer (160k database with live search & filters)
│   │   └── roadmap/
│   │       └── RoadmapModal.tsx        # In-app interactive 6-member roadmap & GitHub branch guide
│   ├── data/
│   │   └── titleMasterSample.json      # 2,500 real verified titles extracted from title_master.csv
│   ├── utils/
│   │   ├── audio.ts                    # Procedural Web Audio API sound synthesizer
│   │   ├── transliteration.ts          # Multi-script transliteration (Devanagari, Bengali, Tamil, etc.)
│   │   ├── similarity.ts               # 4-D similarity algorithms (Levenshtein, Soundex, Semantic, Core-Word)
│   │   ├── rulesEngine.ts              # Deterministic PRGI 2025 government rules evaluator
│   │   └── verificationEngine.ts       # Unified 5-stage pipeline orchestrator (Client AI + FastAPI bridge)
│   ├── types/
│   │   └── index.ts                    # Complete domain TypeScript definitions
│   ├── App.tsx                         # Root app shell with view state & 3D integration
│   ├── main.tsx
│   └── index.css                       # Design tokens, glassmorphism, glowing badges, animations
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 5. Development & Running Instructions

### 1. Start the Frontend Development Server:
```bash
cd /Users/shridhartawate/Documents/SIH/frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. Live Backend Integration (When FastAPI Backend is Ready):
- Member 1's FastAPI server should run at `http://localhost:8000`.
- In the frontend header, toggle **"Engine: Client AI"** to **"Live FastAPI: 8000"**.
- If the live backend is unreachable, the frontend automatically falls back to its internal client-side AI verification engine for offline demonstrations.

### 3. Production Build Validation:
```bash
cd /Users/shridhartawate/Documents/SIH/frontend
npm run build
```

---

## 6. GitHub Branching & Collaboration Strategy

Follow the project repository workflow:
- **`main`**: Protected branch for demo-ready releases.
- **`develop`**: Integration branch for merged features.
- **Feature Branches**:
  - `feature/member-1-backend`
  - `feature/member-2-ml`
  - `feature/member-3-search`
  - `feature/member-4-rules-rag`
  - `feature/member-5-agents`
  - `feature/member-6-frontend`
