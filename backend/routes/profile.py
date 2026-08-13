from fastapi import APIRouter, HTTPException

from services.candidate_profile import (
    get_candidate_profile,
    get_candidate_graph
)


router = APIRouter()


# =========================================================
# CANDIDATE PROFILE
# =========================================================

@router.get("/{email}")
def candidate_profile(email: str):

    try:

        candidate = get_candidate_profile(
            email
        )

        if not candidate:

            raise HTTPException(
                status_code=404,
                detail="Candidate not found."
            )

        return {
            "success": True,
            "candidate": candidate
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            "\n========== PROFILE ERROR =========="
        )

        import traceback
        traceback.print_exc()

        print(
            "===================================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# KNOWLEDGE GRAPH
# =========================================================

@router.get("/{email}/graph")
def candidate_graph(email: str):

    try:

        graph = get_candidate_graph(
            email
        )

        if not graph:

            raise HTTPException(
                status_code=404,
                detail="Candidate graph not found."
            )

        return {
            "success": True,
            "graph": graph
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            "\n========== GRAPH ERROR =========="
        )

        import traceback
        traceback.print_exc()

        print(
            "=================================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )