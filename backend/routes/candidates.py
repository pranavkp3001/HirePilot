from fastapi import APIRouter, Query

from services.candidate_search import search_candidates
from services.intelligent_search import (
    search_candidates_intelligently
)
from services.recruiter_ai import (
    generate_recruiter_response
)


router = APIRouter()


# =========================================================
# STRUCTURED SEARCH
# =========================================================

@router.get("/search")
def search(
    skills: str = Query(default=""),
    role: str = Query(default=""),
    limit: int = Query(
        default=10,
        ge=1,
        le=50
    )
):

    skill_list = [
        skill.strip()
        for skill in skills.split(",")
        if skill.strip()
    ]


    candidates = search_candidates(
        skills=skill_list,
        role=role,
        limit=limit
    )


    return {
        "success": True,
        "count": len(candidates),
        "candidates": candidates
    }


# =========================================================
# INTELLIGENT RECRUITER SEARCH
# =========================================================

@router.get("/intelligent-search")
def intelligent_search(
    query: str = Query(
        ...,
        description=(
            "Natural language recruiter query"
        )
    ),

    top_k: int = Query(
        default=5,
        ge=1,
        le=20
    )
):

    try:

        # ---------------------------------------------
        # STEP 1
        # ChromaDB + Neo4j retrieval
        # ---------------------------------------------

        retrieval = (
            search_candidates_intelligently(
                query=query,
                top_k=top_k
            )
        )


        candidates = retrieval.get(
            "candidates",
            []
        )


        # ---------------------------------------------
        # STEP 2
        # Gemini reasoning
        # ---------------------------------------------

        ai_response = (
            generate_recruiter_response(
                query=query,
                candidates=candidates
            )
        )


        # ---------------------------------------------
        # FINAL RESPONSE
        # ---------------------------------------------

        return {
            "success": True,

            "query": query,

            "retrieval": {
                "count": len(candidates),

                "candidates": candidates
            },

            "ai_analysis": ai_response
        }


    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }