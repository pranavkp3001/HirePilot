from rag.vector_store import search as semantic_search
from services.neo4j_service import driver


def search_candidates_intelligently(
    query,
    top_k=5,
):
    """
    Hybrid candidate retrieval.

    ChromaDB:
        Finds semantically relevant resumes.

    Neo4j:
        Retrieves verified structured candidate data.

    The two sources are joined using candidate email.
    """

    if not query or not query.strip():
        return {
            "query": query,
            "count": 0,
            "candidates": [],
        }

    # =====================================================
    # STEP 1 — CHROMADB SEMANTIC SEARCH
    # =====================================================

    chroma_results = semantic_search(
        query=query,
        n_results=top_k,
    )

    ids = chroma_results.get("ids", [[]])
    metadatas = chroma_results.get("metadatas", [[]])
    documents = chroma_results.get("documents", [[]])
    distances = chroma_results.get("distances", [[]])

    ids = ids[0] if ids else []
    metadatas = metadatas[0] if metadatas else []
    documents = documents[0] if documents else []
    distances = distances[0] if distances else []

    if not metadatas:
        return {
            "query": query,
            "count": 0,
            "candidates": [],
        }

    # =====================================================
    # STEP 2 — BUILD CHROMA RESULTS
    # =====================================================

    chroma_candidates = []

    for index, metadata in enumerate(metadatas):

        email = metadata.get("email")

        if not email:
            continue

        distance = None

        if index < len(distances):
            distance = distances[index]

        document = ""

        if index < len(documents):
            document = documents[index]

        chroma_candidates.append(
            {
                "email": email,
                "name": metadata.get("name", ""),
                "role": metadata.get("role", ""),
                "distance": distance,
                "resume_excerpt": document[:500],
                "rank": index + 1,
            }
        )

    candidate_emails = [
        candidate["email"]
        for candidate in chroma_candidates
    ]

    if not candidate_emails:
        return {
            "query": query,
            "count": 0,
            "candidates": [],
        }

    # =====================================================
    # STEP 3 — NEO4J STRUCTURED RETRIEVAL
    # =====================================================

    with driver.session() as session:

        result = session.run(
            """
            MATCH (c:Candidate)

            WHERE c.email IN $emails

            OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)

            OPTIONAL MATCH (c)-[:BUILT]->(p:Project)

            WITH
                c,
                collect(DISTINCT s.name) AS skills,
                collect(
                    DISTINCT {
                        title: p.title,
                        description: p.description
                    }
                ) AS projects

            RETURN
                c.name AS name,
                c.email AS email,
                c.phone AS phone,
                c.summary AS summary,
                c.role AS recommended_role,
                c.match_score AS match_score,
                skills,
                projects
            """,
            emails=candidate_emails,
        )

        neo4j_candidates = {}

        for record in result:

            email = record["email"]

            neo4j_candidates[email] = {
                "name": record["name"],
                "email": email,
                "phone": record["phone"],
                "summary": record["summary"],
                "recommended_role": record[
                    "recommended_role"
                ],
                "match_score": record["match_score"],
                "skills": record["skills"],
                "projects": record["projects"],
            }

    # =====================================================
    # STEP 4 — JOIN CHROMA + NEO4J
    # =====================================================

    final_candidates = []

    for chroma_candidate in chroma_candidates:

        email = chroma_candidate["email"]

        candidate = neo4j_candidates.get(email)

        if not candidate:
            continue

        candidate["retrieval_rank"] = (
            chroma_candidate["rank"]
        )

        candidate["chroma_distance"] = (
            chroma_candidate["distance"]
        )

        candidate["resume_excerpt"] = (
            chroma_candidate["resume_excerpt"]
        )

        final_candidates.append(candidate)

    # =====================================================
    # STEP 5 — PRESERVE CHROMA RANKING
    # =====================================================

    final_candidates.sort(
        key=lambda candidate: candidate[
            "retrieval_rank"
        ]
    )

    return {
        "query": query,
        "count": len(final_candidates),
        "candidates": final_candidates,
    }