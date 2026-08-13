# HirePilot API Overview

The backend is implemented with FastAPI. Interactive API documentation is available locally at:

```text
http://127.0.0.1:8000/docs
```

## Health

### `GET /`

Returns the API welcome message.

### `GET /health`

Returns the backend health status.

---

## Resume

### Resume upload / analysis

The resume route accepts an uploaded PDF and runs the resume extraction and candidate-analysis pipeline.

The exact request schema is defined by `backend/routes/resume.py` and is exposed automatically through FastAPI's OpenAPI documentation.

---

## Candidate Search

### `GET /api/candidates/search`

Searches candidate profiles using the candidate-search service.

Example:

```text
GET /api/candidates/search?skills=Python,RAG
```

---

## Candidate Profile

### `GET /api/candidates/{email}`

Retrieves a candidate profile using the candidate email.

Example:

```text
GET /api/candidates/pranavkp100205%40gmail.com
```

The response can include:

- candidate identity
- summary
- role
- match score
- skills
- education
- projects
- technologies

---

## Candidate Graph

### `GET /api/candidates/{email}/graph`

Returns graph data associated with a candidate for frontend visualization.

The graph is backed by Neo4j relationships between candidate entities, skills, projects, education, and technologies.

---

## RAG Search

### `GET /api/search`

Runs natural-language retrieval over the configured vector store.

Example:

```text
GET /api/search?query=Find candidates with RAG backend experience&top_k=5
```

---

## JD Matching

### `POST /api/match`

Accepts:

- a resume PDF
- a job description

The route parses the resume, creates a candidate profile, and evaluates the candidate against the supplied JD.

Conceptual request:

```text
multipart/form-data

resume=<resume.pdf>
job_description=<job description text>
```

The response contains:

```json
{
  "candidate": {},
  "match": {
    "overall_match": 0,
    "skill_match": 0,
    "experience_match": 0,
    "education_match": 0,
    "matching_skills": [],
    "missing_skills": [],
    "recommendation": ""
  }
}
```

The actual schema should be treated as the source of truth in the running FastAPI OpenAPI documentation.

---

## API Design Notes

The backend separates routing from business logic:

```text
routes/
   ↓
services/
   ↓
AI / retrieval / database layers
```

This keeps HTTP concerns separate from parsing, retrieval, scoring, graph operations, and model calls.
