from fastapi import APIRouter, Form, HTTPException

from services.intelligent_search import (
    search_candidates_intelligently
)

from services.jd_matcher import (
    compare_candidates
)


router = APIRouter()


# =========================================================
# JD MATCHING
# =========================================================

@router.post("/match")
async def match_candidates(
    job_description: str = Form(...)
):

    # -----------------------------------------------------
    # Validate JD
    # -----------------------------------------------------

    if not job_description.strip():

        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )


    # -----------------------------------------------------
    # STEP 1
    # ChromaDB + Neo4j candidate retrieval
    # -----------------------------------------------------

    retrieval = search_candidates_intelligently(
        query=job_description,
        top_k=10
    )

    candidates = retrieval.get(
        "candidates",
        []
    )


    # -----------------------------------------------------
    # No candidates found
    # -----------------------------------------------------

    if not candidates:

        return {
            "success": True,
            "job_description": job_description,
            "count": 0,
            "results": []
        }


    # -----------------------------------------------------
    # STEP 2
    # Gemini JD comparison
    # -----------------------------------------------------

    matches = compare_candidates(
        candidates,
        job_description
    )


    # -----------------------------------------------------
    # STEP 3
    # Return ranked candidates
    # -----------------------------------------------------

    return {
        "success": True,
        "job_description": job_description,
        "count": len(matches),
        "results": matches
    }