# HirePilot

### AI-Powered Recruitment Intelligence Platform

HirePilot is an end-to-end recruitment intelligence platform that helps recruiters parse resumes, discover relevant candidates, compare candidates against job descriptions, and explore candidate relationships through semantic retrieval and knowledge graphs.

The project combines **LLM-powered profile extraction**, **vector search**, **Neo4j knowledge graphs**, **deterministic scoring**, and a **React + FastAPI** application into one workflow.

> **Project status:** Active portfolio project. Core resume parsing, candidate retrieval, JD matching, candidate profiles, and graph visualization are implemented. The AI layer uses the Gemini API and therefore requires a valid API key and available model quota.

---

## Why HirePilot?

Traditional resume screening is repetitive and keyword-heavy. HirePilot is designed around a retrieval-and-evaluation workflow:

```text
Resume / Candidate Data
          |
          v
   Resume Extraction
          |
          v
 Structured Candidate Profile
       /            \
      v              v
 Vector Store      Neo4j Graph
      |              |
      +------v-------+
             |
      Candidate Retrieval
             |
             v
       JD Comparison
        /          \
       v            v
 Deterministic    LLM Evaluation
 Skill Matching   / Qualitative Analysis
       \            /
        +----v-----+
             |
             v
       Candidate Ranking
```

---

## Key Features

### Resume Intelligence

- PDF resume parsing
- Structured candidate extraction
- Education, skills, experience, and project extraction
- Gemini-powered resume analysis
- Candidate profile generation

### Semantic Candidate Search

- ChromaDB-backed vector retrieval
- Natural-language candidate search
- Resume excerpts and project context for retrieval
- Semantic relevance scoring

### Knowledge Graph

- Candidate → Skill relationships
- Candidate → College relationships
- Candidate → Project relationships
- Project → Technology relationships
- Neo4j graph visualization for candidate exploration

### JD Matcher

- Upload a candidate resume
- Paste a job description
- Extract candidate capabilities
- Compare JD requirements with candidate skills
- Identify matching and missing skills
- Generate recruiter-style recommendations

### Recruiter Dashboard

- Candidate profiles
- Candidate search
- Project and skill views
- Knowledge graph visualization
- JD matching interface
- API-backed frontend architecture

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | Python, FastAPI |
| LLM | Google Gemini API |
| Vector Search | ChromaDB |
| Knowledge Graph | Neo4j |
| Retrieval | Embeddings, semantic search, RAG |
| Data | JSON, PDF parsing, structured candidate profiles |
| Development | Git, GitHub |

---

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the detailed component and request-flow design.

The main backend responsibilities are separated into:

```text
backend/
├── routes/       # API endpoints
├── services/     # Business logic and AI services
├── rag/          # Retrieval and vector-store logic
└── prompts/      # LLM prompts
```

The frontend is organized into reusable components and pages:

```text
frontend/
└── src/
    ├── components/
    ├── pages/
    └── services/
```

---

## Candidate Matching Pipeline

HirePilot uses multiple signals rather than relying on one LLM response.

### 1. Candidate retrieval

A natural-language query is converted into a semantic search against resume content stored in ChromaDB.

### 2. Deterministic skill coverage

Explicit candidate skills are compared against important job requirements. This keeps hard-skill matching reproducible.

### 3. Knowledge-graph context

Neo4j stores relationships between candidates, skills, education, projects, and technologies. This enables graph-based exploration and richer candidate context.

### 4. AI evaluation

Gemini evaluates qualitative alignment between a candidate profile and the job description, including experience and project relevance.

### 5. Final ranking

The application can combine retrieval, deterministic matching, and AI evaluation into a final candidate ranking.

See [`docs/scoring.md`](docs/scoring.md) for the scoring design and current limitations.

---

## API Overview

The FastAPI backend exposes endpoints for major recruitment workflows, including:

- Resume upload and analysis
- Candidate search
- Candidate profile retrieval
- Candidate graph retrieval
- RAG search
- Job-description matching
- Interview/report workflows

See [`docs/api.md`](docs/api.md) for the endpoint map and example requests.

---

## Local Development

### Prerequisites

- Python 3.11+ recommended
- Node.js and npm
- A Gemini API key
- Neo4j instance for graph features

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI docs:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Environment Variables

Create a local `.env` file in the backend environment.

Use [`.env.example`](.env.example) as the template.

Required configuration includes:

```text
GEMINI_API_KEY=
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=
```

**Never commit a real `.env` file or API keys.**

---

## Screenshots

### Knowledge Graph

![HirePilot knowledge graph](screenshots/knowledge-graph.png)

The graph view connects candidate profiles with skills, projects, technologies, and related entities through Neo4j.

---

## Engineering Decisions

### Why semantic retrieval?

Keyword search can miss candidates who describe the same experience using different terminology. Semantic retrieval allows natural-language queries to find conceptually related resume content.

### Why Neo4j?

Candidate information is naturally relational. A candidate can have many skills, projects, technologies, and educational relationships. A graph database makes these relationships explicit and queryable.

### Why deterministic matching alongside an LLM?

Hard requirements such as explicit skills, permissions, file validation, and other constraints should be reproducible. LLMs are better suited to qualitative interpretation and contextual evaluation. Keeping these responsibilities separate reduces unnecessary model calls and makes scoring easier to reason about.

---

## Current Limitations

- Gemini-based features require API quota and can become temporarily unavailable when the configured project reaches its model limits.
- Neo4j graph features require a running and reachable Neo4j instance.
- Retrieval quality depends on the quality of extracted resume text and the embedding/vector-search configuration.
- The current project is intended as a portfolio/prototype system rather than a production HR platform.

---

## Roadmap

- [ ] Hybrid keyword + semantic retrieval
- [ ] Retrieval evaluation benchmarks
- [ ] Cross-encoder / reranking experiments
- [ ] Deterministic scoring fallback when LLM evaluation is unavailable
- [ ] Automated interview generation and evaluation
- [ ] Recruiter email workflows
- [ ] Authentication and role-based access
- [ ] Automated tests and CI
- [ ] Production deployment

---

## Project Structure

```text
HirePilot/
├── backend/
│   ├── prompts/
│   ├── rag/
│   ├── routes/
│   ├── services/
│   ├── requirements.txt
│   └── app.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── api.md
│   ├── architecture.md
│   └── scoring.md
│
├── screenshots/
├── .env.example
├── .gitignore
└── README.md
```

---

## Author

**Pranav K P**  
B.Tech Information Science Engineering

- GitHub: [@pranavkp3001](https://github.com/pranavkp3001)
- LinkedIn: [pranavkp10](https://www.linkedin.com/in/pranavkp10)

---

## License

This project is released under the MIT License. See [`LICENSE`](LICENSE).
