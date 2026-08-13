from fastapi import APIRouter, Query
from rag.retriever import retrieve

router = APIRouter()


@router.get("/search")
def search_resumes(
    query: str = Query(..., description="Search query"),
    top_k: int = 5,
):
    try:
        results = retrieve(query)

        return {
            "success": True,
            "query": query,
            "results": results
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }