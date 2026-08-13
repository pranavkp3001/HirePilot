from services.gemini import analyze_candidates


def generate_recruiter_response(
    query,
    candidates
):
    """
    Generate a grounded recruiter response
    from candidates retrieved through ChromaDB
    and Neo4j.
    """

    if not candidates:

        return {
            "answer": (
                "No matching candidates were found."
            ),
            "rankings": []
        }


    return analyze_candidates(
        recruiter_query=query,
        candidates=candidates
    )