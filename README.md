# CivicSecondBrain 🏛️
### AI-Powered City Council Knowledge Base — Schertz, TX

A persistent, AI-maintained knowledge base that gives City Council members
instant, cited answers about their city and proactive improvement recommendations.
Built on the [Karpathy LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

---

## What It Does

| Feature | Description |
|---|---|
| **Chat Q&A** | Ask anything about the city in plain English — get cited answers from real city documents |
| **Persistent Wiki** | Claude builds and maintains a structured wiki from every ingested document |
| **Smart Ingestion** | Discovers and processes documents from schertz.com and Laserfiche |
| **Proactive Recommendations** | Nightly AI analysis surfaces budget trends, strategic plan gaps, and improvement opportunities |
| **City Health Dashboard** | At-a-glance view of civic KPIs and pending AI alerts |
| **Wiki Browser** | Browse all ingested wiki pages at `/wiki`, grouped by category |

---

## Architecture (Karpathy LLM Wiki Pattern)

```
Raw Sources (PDFs, HTML)
    → INGEST (Claude builds wiki pages)
    → QUERY  (Claude answers from wiki, with citations)
    → LINT   (Claude analyzes full wiki, generates recommendations)
```

Three layers:
1. **`raw-sources/`** — immutable downloaded documents; `manifest.json` tracks what has been ingested
2. **`wiki/`** — LLM-generated, persistent markdown knowledge base
3. **`app/`** — Next.js chat interface + API routes + dashboard

---

## Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key

### Setup

```bash
git clone https://github.com/your-org/civic-second-brain
cd civic-second-brain

npm install

cp .env.example .env.local
# Set ANTHROPIC_API_KEY in .env.local

# Bootstrap the wiki from Schertz documents
npm run ingest:seed

# Launch the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Run unit tests (Vitest) |
| `npm run ingest:seed` | Full seed ingestion from all sources (run once to bootstrap) |
| `npm run ingest:seed -- --dry-run` | Discover documents without downloading |
| `npm run ingest:seed -- --type budget` | Ingest only budget documents |
| `npm run ingest:seed -- --limit 5` | Process first 5 documents (for testing) |
| `npm run ingest:doc` | Ingest a single document by URL |
| `npm run lint:wiki` | Run wiki health check + generate AI recommendations |
| `npm run scrape:check` | Check for new documents without ingesting |

---

## Data Sources

Ingestion pulls from three sources automatically:

### 1. CivicPlus DocumentCenter (`schertz.com/DocumentCenter`)
Deep crawl via the internal `Document_AjaxBinding` JSON API. Covers these folder trees:
- Budget & Finance (budgets, CIP, fee schedules, tax rates)
- Boards & Commissions, City Council, City Secretary
- Government, Public Information
- Planning, Parks & Recreation, Fire, EMS, Police

### 2. Laserfiche WebLink (`laserfiche.schertzweb.com`)
Recursive crawl of the public records archive via `FolderListingService.aspx`. Covers:
- City Council agendas & minutes (769+ documents)
- City Boards and Commissions agendas & minutes
- Finance Information, Resolutions, Ordinances
- Public Hearing and Public Notices, Public Publications
- Election Information, Charter Review Commission

### 3. Budget & Finance sub-pages
Direct scrape of `/250` (Financial Transparency), `/249` (Debt Obligations), `/247` (City Pension), `/248` (TMRS), and `/2125` (Public Notices) for documents not surfaced by the folder crawls.

> **Note:** Board agendas are sourced exclusively from Laserfiche. The `/273/Agendas-Minutes` CivicPlus page links to Laserfiche and does not serve documents directly.

---

## Wiki Structure

```
wiki/
├── SCHEMA.md                    ← Governing document for wiki conventions
├── index.md                     ← Content catalog used by the query engine
├── log.md                       ← Append-only operation history
├── topics/
│   ├── budget.md                ← Budget & Finance (multi-year trends)
│   ├── ordinances.md            ← Ordinance index & amendments
│   ├── infrastructure.md        ← Roads, utilities, parks, CIP
│   ├── public-safety.md         ← Police, fire, courts
│   ├── development.md           ← Zoning, permits, EDC
│   ├── governance.md            ← Charter, boards, elections
│   ├── financial-report.md      ← ACFRs, audits, transparency reports
│   └── strategic-plan.md        ← Goals, KPIs, progress
├── decisions/
│   └── YYYY-MM-DD-[board].md    ← Per-meeting votes & decisions
├── people/
│   ├── council-members.md       ← Roster, roles, vote history
│   └── boards.md                ← Advisory boards
├── recommendations/
│   └── YYYY-MM-DD-[topic].md    ← AI-generated analysis (requires council review)
└── queries/
    └── [filed answers]          ← Saved Q&A for reuse
```

All wiki pages use YAML frontmatter (`title`, `type`, `category`, `sources`, `last_updated`) and inline `[SOURCE: filename, p.N]` citations. Financial figures always carry fiscal year context (`$4.2M FY2024`). Schertz fiscal year runs Oct 1 – Sep 30.

---

## App Routes

| Route | Description |
|---|---|
| `/` | Chat Q&A interface |
| `/wiki` | Browse all wiki pages by category |
| `/dashboard` | City health dashboard — KPIs and AI recommendations |
| `/admin` | Document ingestion management |
| `POST /api/chat` | Streaming chat endpoint (plain text delta stream) |
| `POST /api/ingest` | Trigger document ingestion |
| `POST /api/lint` | Trigger wiki health check |

---

## Cloud Deployment (AWS)

See `infrastructure/` for the AWS CDK stack.

| Component | AWS Service |
|---|---|
| App hosting | Amplify / ECS Fargate |
| Auth | Cognito (MFA) |
| Document storage | S3 (raw-sources, wiki) |
| Semantic search | OpenSearch k-NN (replaces keyword selection at scale) |
| Scheduler | EventBridge + Lambda (nightly LINT) |
| Monitoring | CloudWatch |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **AI:** Anthropic Claude (`@anthropic-ai/sdk`) — Sonnet for query/lint, configurable
- **Scraping:** Axios + Cheerio + custom CivicPlus/Laserfiche API clients
- **PDF Parsing:** pdf-parse
- **Styling:** Tailwind CSS
- **Testing:** Vitest (31 unit tests — wiki reader/writer, pdf-parser)
- **Language:** TypeScript

---

## License

Copyright (c) 2024 Jose Leos. All rights reserved.

This software is proprietary and confidential. Unauthorized use, copying,
distribution, or modification is strictly prohibited. See [LICENSE](LICENSE) for details.
