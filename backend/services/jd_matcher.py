import json
import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai.errors import ServerError, ClientError


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# ============================================================
# GEMINI MODEL
# ============================================================

MODEL = "gemini-flash-latest"


# ============================================================
# PROMPT
# ============================================================

PROMPT = """
You are HirePilot AI, an expert technical recruiter.

Compare the candidate profile with the job description.

Evaluate ONLY information explicitly present in the
candidate profile and job description.

Never invent skills, experience, education, projects,
certifications, or qualifications.

Return ONLY valid JSON.

Required JSON structure:

{
    "overall_match": 0,
    "skill_match": 0,
    "experience_match": 0,
    "education_match": 0,
    "matching_skills": [],
    "missing_skills": [],
    "recommendation": ""
}

SCORING:

overall_match:
Overall suitability for the position.
Integer between 0 and 100.

skill_match:
How many important technical requirements from the JD
are explicitly present in the candidate profile.
Integer between 0 and 100.

experience_match:
How closely the candidate's projects and experience
match the responsibilities of the JD.
A student with strong relevant projects can score highly.
Do not assume professional experience that isn't provided.
Integer between 0 and 100.

education_match:
How well the candidate's stated education matches the
education requirements in the JD.
Integer between 0 and 100.

matching_skills:
Only include skills explicitly present in both the
candidate profile and JD.

missing_skills:
Only include important skills explicitly required by
the JD that are not explicitly present in the candidate
profile.

recommendation:
Give a concise recruiter-style recommendation.
Mention the strongest reasons for the match and important
gaps if they exist.

IMPORTANT RULES:

1. Never fabricate candidate information.
2. Do not infer a technology unless clearly supported.
3. Do not treat unrelated technologies as equivalent.
4. Score fields must contain numbers only.
5. matching_skills must be an array.
6. missing_skills must be an array.
7. recommendation must be a string.
8. Return ONLY JSON.
9. Do not use Markdown.
10. Do not wrap JSON in ```.

CANDIDATE:

{candidate}

JOB DESCRIPTION:

{jd}
"""


# ============================================================
# CLEAN GEMINI OUTPUT
# ============================================================

def clean_json_output(output):

    output = output.strip()

    if output.startswith("```json"):
        output = output[len("```json"):].strip()

    elif output.startswith("```"):
        output = output[len("```"):].strip()

    if output.endswith("```"):
        output = output[:-3].strip()

    return output


# ============================================================
# VALIDATE GEMINI RESULT
# ============================================================

def validate_result(result):

    required_fields = [
        "overall_match",
        "skill_match",
        "experience_match",
        "education_match",
        "matching_skills",
        "missing_skills",
        "recommendation"
    ]

    for field in required_fields:

        if field not in result:
            raise ValueError(
                f"Missing field: {field}"
            )


    score_fields = [
        "overall_match",
        "skill_match",
        "experience_match",
        "education_match"
    ]

    for field in score_fields:

        try:
            result[field] = int(
                float(result[field])
            )

        except (TypeError, ValueError):

            raise ValueError(
                f"Invalid score for {field}"
            )

        result[field] = max(
            0,
            min(
                100,
                result[field]
            )
        )


    if not isinstance(
        result["matching_skills"],
        list
    ):
        result["matching_skills"] = []


    if not isinstance(
        result["missing_skills"],
        list
    ):
        result["missing_skills"] = []


    if not isinstance(
        result["recommendation"],
        str
    ):
        result["recommendation"] = str(
            result["recommendation"]
        )


    return result


# ============================================================
# COMPARE ONE CANDIDATE
# ============================================================

def compare(candidate, jd):

    candidate_json = json.dumps(
        candidate,
        indent=2,
        ensure_ascii=False
    )

    prompt = PROMPT.replace(
        "{candidate}",
        candidate_json
    ).replace(
        "{jd}",
        jd
    )


    last_error = None


    # ========================================================
    # RETRIES
    # ========================================================

    for attempt in range(3):

        try:

            print(
                f"JD Matcher: {MODEL} "
                f"(Attempt {attempt + 1})"
            )


            response = client.models.generate_content(

                model=MODEL,

                contents=prompt,

                config={
                    "response_mime_type": "application/json"
                }
            )


            if not response.text:

                raise ValueError(
                    "Gemini returned an empty response."
                )


            output = response.text.strip()


            print(
                "\n========== JD MATCHER OUTPUT ==========\n"
            )

            print(output)

            print(
                "\n=======================================\n"
            )


            output = clean_json_output(
                output
            )


            result = json.loads(
                output
            )


            result = validate_result(
                result
            )


            print(
                "✓ JD comparison successful"
            )

            print(
                f"Overall Match: "
                f"{result['overall_match']}%"
            )

            print(
                f"Skill Match: "
                f"{result['skill_match']}%"
            )

            print(
                f"Experience Match: "
                f"{result['experience_match']}%"
            )

            print(
                f"Education Match: "
                f"{result['education_match']}%"
            )


            return result


        except ServerError as e:

            last_error = e

            print(
                "Gemini server error:"
            )

            print(e)

            time.sleep(
                2 * (attempt + 1)
            )


        except ClientError as e:

            last_error = e

            print(
                "Gemini client error:"
            )

            print(e)

            break


        except json.JSONDecodeError as e:

            last_error = e

            print(
                "Invalid JSON returned by Gemini:"
            )

            print(output)

            time.sleep(1)


        except ValueError as e:

            last_error = e

            print(
                "JD comparison validation error:"
            )

            print(e)

            time.sleep(1)


        except Exception as e:

            last_error = e

            print(
                "JD comparison error:"
            )

            print(e)

            time.sleep(1)


    # ========================================================
    # FAILED RESULT
    # ========================================================

    print(
        "\n❌ JD comparison failed."
    )

    print(
        f"Reason: {last_error}"
    )


    return {
        "overall_match": None,
        "skill_match": None,
        "experience_match": None,
        "education_match": None,
        "matching_skills": [],
        "missing_skills": [],
        "recommendation": (
            "AI comparison could not be completed."
        ),
        "error": str(last_error)
    }


# ============================================================
# COMPARE CANDIDATES
#
# This function is intentionally provided because
# routes/match.py imports:
#
#     from services.jd_matcher import compare_candidates
#
# ============================================================

def compare_candidates(candidate, jd):

    return compare(
        candidate,
        jd
    )