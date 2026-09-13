# NYAYALENS (न्यायलेंस)
> **"Understand your rights. Know your next step."**  
> *Legal documents shouldn't require a law degree to understand.*

Built for **PromptWars: Virtual — AI for Legal Assistance & Access**.

---

## 1. Project Overview
**NyayaLens** is a production-quality AI legal assistance platform engineered to demystify complex contracts, leases, notice letters, and agreements. By transforming dense legal prose into plain-language summaries, structured attention indicators, interactive clause explanations, and actionable consultation briefs, NyayaLens empowers everyday citizens, employees, and small business owners to understand what they are signing.

> ### ⚖️ Responsible AI Notice & Legal Disclaimer
> **NyayaLens is designed to assist users in understanding and navigating legal information. It does not replace professional legal advice.**  
> NyayaLens provides AI-assisted document comprehension and preparation. It does not act as an attorney, make definitive legal adjudications, guarantee litigation outcomes, or declare terms definitively legal or illegal without qualification. Important legal decisions should always be reviewed with a qualified legal professional.

---

## 2. The Problem
Legal language is deliberately formal, layered with archaic jargon, jurisdictional traps, and restrictive covenants. Non-lawyers frequently sign agreements without understanding:
- Post-employment restrictions and non-compete liabilities (e.g., Section 27 of the Indian Contract Act)
- Vaguely defined "material breach" and immediate termination clauses
- Unilateral intellectual property assignment over personal side projects
- Critical notice periods, renewal windows, and statute-bound deadlines

---

## 3. The NyayaLens Solution: UNDERSTAND → CHECK → ACT

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   UNDERSTAND    │  ──►  │      CHECK      │  ──►  │       ACT       │
│ • Plain Summary │       │ • Attention Map │       │ • Action Steps  │
│ • Clause Simp.  │       │ • Obligations   │       │ • Checklist     │
│ • Multi-lang    │       │ • Deadlines     │       │ • Questions     │
│ • AI Explainer  │       │ • Comparison    │       │ • Lawyer Brief  │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                   │
                                   ▼
                    GROUNDED NYAYA AI ASSISTANT
             (Document-aware chat citing exact pages & sections)
```

1. **UNDERSTAND**: Summarizes documents in plain language, decomposes complex clauses, and offers a toggleable "Explain Simply" mode for every critical section.
2. **CHECK**: Scans for attention areas categorized by severity (`High`, `Medium`, `Low` Attention), maps all bilateral obligations, plots deadlines along an interactive chronological timeline, and flags contract inconsistencies.
3. **ACT**: Generates pragmatic next steps, an interactive pre-signing verification checklist, targeted questions to ask legal counsel, and a downloadable **Lawyer Consultation Brief**.

---

## 4. Key Features

- **Document Analysis Workspace (`/documents/[id]`)**: 3-panel legal command center showing document metadata, overview badges, clause cards, obligations, date timeline, and grounded AI assistant.
- **Explain Simply & Clause Deep-Dive**: Side-by-side modal displaying the original legal text, plain-language breakdown, "Why it may matter", and questions to consider asking.
- **Contract Comparison Engine (`/compare`)**: Side-by-side analysis comparing original vs. revised agreements, highlighting added, removed, changed, and high-attention differences.
- **Action Center (`/action-center`)**:
  - Step-by-step next actions
  - Interactive "Before Signing" checklist with persistence
  - Targeted questions categorized by priority
  - Exportable & downloadable **Lawyer Consultation Brief**
- **Document-Aware Nyaya AI Chat (`/chat`)**: Contextual assistant grounded in document facts. When examining a specific clause, clicking "Ask AI" scopes the chat session to that clause.
- **Instant Demo Mode**: Includes a comprehensive, pre-computed Indian Employment Agreement analysis available with zero setup.
- **Multilingual Ready**: Language switcher supporting English, Hindi (हिन्दी), and Telugu (తెలుగు).

---

## 5. Technology Stack & AI Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + TypeScript (Strict) | Full-stack architecture, Server Actions & API Route Handlers |
| **Styling & UI** | Tailwind CSS v4, shadcn/ui, Lucide Icons | Premium deep navy & violet legal-tech design language, accessible dark mode |
| **Primary AI Provider**| **Google Gemini API** (`gemini-2.5-flash`) | Document understanding, structured JSON extraction, comparative reasoning, grounded chat |
| **AI Orchestration** | **Vercel AI SDK** (`ai`, `@ai-sdk/google`, `zod`) | Type-safe structured object generation (`generateObject`) and real-time streaming (`streamText`) |
| **Document Processing**| `pdf-parse` + Buffer Extraction | High-fidelity text & page segmentation from PDFs, TXT, and DOCX |
| **Database / Persistence** | Supabase (PostgreSQL + RLS) + In-Memory Fallback | Hybrid persistence supporting cloud storage or zero-dependency demo operation |
| **Deployment** | Vercel | Production-ready edge deployment |

---

## 6. Where and How GenAI is Used

Rather than deploying an uncontrolled autonomous agent, NyayaLens utilizes a **controlled AI assistance pipeline**:

```
[Document: PDF/TXT/DOCX]
         │
         ▼
[Text & Page Segmentation]
         │
         ▼
[Gemini API via generateObject] ──► Enforces Zod Schema (DocumentAnalysisSchema)
         │                           - Parties, Summary, Complexity
         │                           - Categorized Attention Areas (High/Med/Low)
         │                           - Extracted Clauses with Plain Explanations
         │                           - Bilateral Obligations & Chronological Dates
         │                           - Discovered Inconsistencies & Lawyer Questions
         ▼
[Structured Document Store]
         │
   ┌─────┴─────────────────────────────────────┐
   ▼                                           ▼
[Grounded Streaming Chat]              [Action Generation]
- Injects selected clause & doc facts  - Checklist items
- Strict citation enforcement          - Formatted Lawyer Brief
- Responsible AI guardrails            - Comparative delta reasoning
```

### Responsible AI Guardrails in System Prompts:
- Strict prohibition against definitive legal judgments (uses *"may"*, *"appears to"*, *"could be worth reviewing"*, *"consider asking a legal professional"*).
- Grounding: If an answer cannot be verified in the provided document, the assistant states: *"I could not reliably locate this information in the document."*
- Cites document name, page number, and clause/section for every factual assertion.
- Persistent visible disclaimers across all AI outputs.

---

## 7. Database Schema (Supabase)

The project includes a complete SQL schema located in `supabase/schema.sql`:
- `profiles` (user preferences, language)
- `documents` (uploaded document metadata, page counts, raw text)
- `document_analyses` (full structured analysis JSON)
- `clauses` (indexed individual clauses for search)
- `obligations` (responsible party, timing, section)
- `important_dates` (deadline values, confidence rating, source text)
- `chat_sessions` & `chat_messages` (persisted grounded dialogue)
- `checklists` & `lawyer_briefs` (action outputs)

*Note: NyayaLens includes a built-in store that operates seamlessly in demo/standalone mode even before Supabase credentials are configured.*

---

## 8. Environment Setup & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/your-username/nyayalens.git
cd nyayalens
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
# Google Gemini API Key (Required for real AI analysis & streaming chat)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Supabase (Optional for demo mode; required for cloud persistence)
NEXT_PUBLIC_SUPABASE_URL=https://ydqmxgsmluanlqsrfgdf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build Verification
```bash
npm run build
npm run start
```

---

## 9. Recommended Hackathon Demonstration Flow

1. **Landing Page (`/`)**:
   - Review the problem statement, value proposition, and responsible AI disclaimer.
   - Click **"Try Demo Document"** or **"Analyze a Document"**.
2. **Document Analysis Workspace (`/documents/demo-doc-1`)**:
   - **Left Panel**: Review the 3-tier attention count (High, Medium, Low), parties identified, and document complexity.
   - **Center Panel**:
     - *Overview Tab*: Read plain-language summary and categorized attention areas (Non-Compete restrictions under Section 27, Non-Solicit duration).
     - *Clauses Tab*: Examine the 6 extracted clauses. Click **"Explain Simply"** on the Non-Compete clause. Click **"View Details"** to view the full side-sheet breakdown.
     - *Obligations Tab*: Inspect grouped obligations between Employer and Employee.
     - *Dates Tab*: Review the timeline of start date, probation completion, and restriction windows.
   - **Right Panel (Nyaya AI)**:
     - Click one of the suggested prompt chips (e.g. *"What are the main things I should review before signing?"*).
     - Watch the real-time streamed response cite specific document clauses.
     - Click **"Ask AI"** on a specific clause to focus the assistant.
3. **Document Comparison (`/compare`)**:
   - Select Document A (Original) and Document B (Revised).
   - Click **"Compare Documents"** to view categorized changes (Added, Removed, Changed, High Priority).
4. **Action Center (`/action-center`)**:
   - Review recommended Next Steps.
   - Interact with the "Before Signing" Checklist.
   - Review targeted questions prepared for legal counsel.
   - Click **"Copy Brief"** or **"Download .txt"** to export the ready-to-share Consultation Brief.
5. **Live Upload Flow (`/documents`)**:
   - Drag and drop a real PDF or TXT contract.
   - Watch the animated 6-stage extraction progress.
   - Arrive at the generated document analysis workspace.

---

## 10. Known Limitations & Future Roadmap

- **OCR for Hand-written Documents**: Currently supports direct text extraction and Gemini multimodal parsing. Full optical character recognition for degraded hand-written physical deeds will benefit from fine-tuned document OCR sidecars.
- **Jurisdiction-Specific Precedent Retrieval**: Future versions can connect to e-Courts APIs and Indian Kanoon databases to cross-reference state-specific high court precedents.
- **Multi-Document Portfolio Risk**: Extending comparison to cross-analyze Master Services Agreements (MSAs) against dozens of Statements of Work (SOWs) simultaneously.

---

## 11. License
Built for the PromptWars Hackathon. Licensed under the Apache-2.0 License.
