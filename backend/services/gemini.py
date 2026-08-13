import os
import json
import time

from dotenv import load_dotenv
from google import genai
from google.genai.errors import ServerError, ClientError


load_dotenv()


# =========================================================
# GEMINI CLIENT
# =========================================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
]


# =========================================================
# RESUME ANALYSIS PROMPT
# =========================================================

PROMPT_TEMPLATE = """
You are HirePilot AI.

You are an expert technical recruiter.

Analyze the following resume carefully.

Return ONLY valid JSON.

DO NOT include markdown.

The response MUST follow this schema exactly.

{
"name":"",
"email":"",
"phone":"",
"summary":"",
"recommended_role":"",
"match_score":0,

"education":[
{
"degree":"",
"college":"",
"cgpa":"",
"year":""
}
],

"skills":[],

"experience":[
{
"company":"",
"role":"",
"duration":"",
"description":""
}
],

"projects":[
{
"title":"",
"description":"",
"tech_stack":[]
}
],

"strengths":[],

"weaknesses":[]
}

Rules:

- Match score should be between 0 and 100.
- Never invent fake information.
- If information doesn't exist use "" or [].
- Return ONLY JSON.

Resume:

{resume}
"""


# =========================================================
# RESUME ANALYSIS
# =========================================================

def analyze_resume(resume_text):

    prompt = PROMPT_TEMPLATE.replace(
        "{resume}",
        resume_text
    )

    last_error = None

    for model in MODELS:

        for attempt in range(3):

            try:

                print(
                    f"\nTrying {model} "
                    f"(Attempt {attempt + 1})"
                )

                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )

                output = response.text.strip()

                if output.startswith("```json"):

                    output = (
                        output
                        .replace("```json", "")
                        .replace("```", "")
                        .strip()
                    )

                elif output.startswith("```"):

                    output = (
                        output
                        .replace("```", "")
                        .strip()
                    )

                candidate = json.loads(output)

                print(
                    "\n========== AI OUTPUT ==========\n"
                )

                print(
                    json.dumps(
                        candidate,
                        indent=2
                    )
                )

                print(
                    "\n===============================\n"
                )

                return candidate

            except ServerError as e:

                print(
                    f"{model} busy. Retrying..."
                )

                last_error = e

                time.sleep(
                    2 * (attempt + 1)
                )

            except ClientError as e:

                print(
                    f"{model} unavailable."
                )

                last_error = e

                break

            except json.JSONDecodeError:

                print(output)

                return {
                    "error": (
                        "Invalid JSON returned "
                        "by Gemini."
                    ),
                    "raw_output": output
                }

            except Exception as e:

                print(e)

                return {
                    "error": str(e)
                }

    return {
        "error": "All AI models failed.",
        "details": str(last_error)
    }


# =========================================================
# RECRUITER AI
# =========================================================

def analyze_candidates(
    recruiter_query,
    candidates
):
    """
    Analyze candidates retrieved from ChromaDB
    and Neo4j.

    IMPORTANT:
    Gemini receives ONLY retrieved candidate data.
    It cannot invent additional candidates.
    """

    if not candidates:

        return {
            "answer": (
                "No matching candidates were found."
            ),
            "rankings": []
        }


    candidate_context = []

    for candidate in candidates:

        candidate_context.append(
            {
                "name": candidate.get(
                    "name",
                    ""
                ),

                "email": candidate.get(
                    "email",
                    ""
                ),

                "recommended_role": candidate.get(
                    "recommended_role",
                    ""
                ),

                "match_score": candidate.get(
                    "match_score",
                    0
                ),

                "skills": candidate.get(
                    "skills",
                    []
                ),

                "projects": candidate.get(
                    "projects",
                    []
                ),

                "summary": candidate.get(
                    "summary",
                    ""
                ),

                "retrieval_rank": candidate.get(
                    "retrieval_rank"
                ),

                "chroma_distance": candidate.get(
                    "chroma_distance"
                )
            }
        )


    context_json = json.dumps(
        candidate_context,
        indent=2,
        ensure_ascii=False
    )


    prompt = f"""
You are HirePilot AI, an AI recruitment
intelligence assistant.

A recruiter submitted the following query:

"{recruiter_query}"

The following candidates were retrieved by
HirePilot's retrieval system.

The candidate information comes from:

1. ChromaDB semantic resume retrieval
2. Neo4j structured candidate knowledge graph

IMPORTANT:

You MUST ONLY use the candidate information
provided below.

Do NOT invent candidates.

Do NOT invent skills.

Do NOT invent projects.

Do NOT invent experience.

Do NOT assume technologies that are not listed.

If the available information is insufficient,
say so explicitly.

Candidate data:

{context_json}


Your task:

1. Determine which retrieved candidates are
   most relevant to the recruiter's query.

2. Rank the candidates from strongest to weakest.

3. Explain the reasoning using only evidence
   from the provided candidate data.

4. Mention specific skills and/or projects
   that support the recommendation.

5. Identify any important gaps when relevant.

6. Keep the response concise and useful to
   a technical recruiter.


Return ONLY valid JSON.

Use exactly this structure:

{{
    "answer": "Overall recommendation",
    "rankings": [
        {{
            "name": "Candidate name",
            "email": "Candidate email",
            "rank": 1,
            "reason": "Evidence-based explanation",
            "strengths": [
                "Relevant strength"
            ],
            "gaps": [
                "Relevant gap"
            ]
        }}
    ]
}}
"""


    last_error = None


    for model in MODELS:

        for attempt in range(3):

            try:

                print(
                    f"\nRecruiter AI: {model} "
                    f"(Attempt {attempt + 1})"
                )


                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )


                output = response.text.strip()


                # Remove markdown code fences
                if output.startswith("```json"):

                    output = (
                        output
                        .replace("```json", "")
                        .replace("```", "")
                        .strip()
                    )

                elif output.startswith("```"):

                    output = (
                        output
                        .replace("```", "")
                        .strip()
                    )


                result = json.loads(output)


                print(
                    "\n========== RECRUITER AI ==========\n"
                )

                print(
                    json.dumps(
                        result,
                        indent=2
                    )
                )

                print(
                    "\n===================================\n"
                )


                return result


            except ServerError as e:

                print(
                    f"{model} busy. Retrying..."
                )

                last_error = e

                time.sleep(
                    2 * (attempt + 1)
                )


            except ClientError as e:

                print(
                    f"{model} unavailable."
                )

                last_error = e

                break


            except json.JSONDecodeError:

                print(
                    "Gemini returned invalid JSON:"
                )

                print(output)

                return {
                    "answer": (
                        "Gemini returned "
                        "invalid JSON."
                    ),
                    "rankings": [],
                    "raw_output": output
                }


            except Exception as e:

                print(
                    "Recruiter AI error:",
                    e
                )

                return {
                    "answer": (
                        "Recruiter analysis failed."
                    ),
                    "rankings": [],
                    "error": str(e)
                }


    return {
        "answer": (
            "All Gemini models failed."
        ),
        "rankings": [],
        "error": str(last_error)
    }