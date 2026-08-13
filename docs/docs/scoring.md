# HirePilot Scoring & Evaluation

## Goal

The matching system should rank candidates using multiple independent signals rather than trusting a single LLM-generated number.

## Signals

### 1. Skill Coverage

Measures how many important job requirements are explicitly supported by the candidate profile.

Example:

```text
JD technical requirements: 10
Candidate explicitly matches: 8

Skill coverage = 8 / 10 = 80%
```

This signal should remain deterministic.

### 2. Semantic Relevance

Measures how relevant the retrieved resume content is to the job-description query using vector retrieval.

A lower vector distance generally indicates stronger semantic similarity for the configured retrieval system. The exact normalization should be documented and tested rather than assumed.

### 3. Experience / Project Relevance

Measures how closely the candidate's projects and experience map to the responsibilities of the role.

This is useful for student and early-career candidates where project experience can be more informative than years of employment.

### 4. AI Evaluation

Gemini evaluates qualitative alignment and produces structured fields such as:

- overall match
- skill match
- experience match
- education match
- matching skills
- missing skills
- recruiter recommendation

The model should not be treated as the sole source of truth for hard requirements.

---

## Recommended Hybrid Formula

A robust production-oriented design is:

```text
Final Score =
    40% × Skill Coverage
  + 30% × Semantic Relevance
  + 20% × AI Evaluation
  + 10% × Project / Experience Relevance
```

The weights are configuration choices, not universal truths. They should be validated against labeled examples before being treated as a production ranking policy.

## Why Hybrid Scoring?

### Problem with LLM-only scoring

An LLM can:

- interpret ambiguous evidence
- produce inconsistent scores
- overvalue impressive wording
- occasionally infer unsupported qualifications
- become unavailable because of quota or service failures

### Problem with keyword-only scoring

Keyword matching can:

- miss synonyms
- miss conceptually related experience
- reward keyword stuffing
- ignore project context

### Hybrid approach

The hybrid design uses deterministic logic for explicit requirements and semantic/LLM methods for context.

```text
Hard requirements
      ↓
Deterministic checks
      +
Semantic retrieval
      +
Project relevance
      +
LLM qualitative evaluation
      ↓
Candidate ranking
```

---

## Evaluation Plan

A serious evaluation setup should create a small labeled dataset of job descriptions and candidates.

For each pair, record:

```text
relevant = 1 / 0
```

Then evaluate:

- Precision@K
- Recall@K
- MRR
- NDCG@K
- Skill-match accuracy
- LLM explanation consistency

The retrieval layer and final ranking layer should be evaluated separately so that a poor final result can be traced to retrieval or ranking.

## Failure Handling

If Gemini is unavailable because of quota, network, or provider errors, the application should retain deterministic retrieval and skill matching where possible instead of treating the entire ranking pipeline as unavailable.

This is a planned improvement for the current prototype.
