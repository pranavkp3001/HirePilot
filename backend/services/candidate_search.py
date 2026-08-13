from services.neo4j_service import driver


def search_candidates(
    skills=None,
    role=None,
    limit=10
):
    """
    Search candidates from the Neo4j knowledge graph.

    Example:
        search_candidates(
            skills=["Python", "RAG"],
            role="Backend Developer"
        )
    """

    skills = skills or []

    with driver.session() as session:

        result = session.run(
            """
            MATCH (c:Candidate)

            OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)

            WITH c,
                 collect(DISTINCT s.name) AS candidate_skills

            WHERE
                (
                    size($skills) = 0
                    OR all(
                        skill IN $skills
                        WHERE skill IN candidate_skills
                    )
                )
                AND
                (
                    $role = ""
                    OR toLower(c.role) CONTAINS toLower($role)
                )

            RETURN
                c.name AS name,
                c.email AS email,
                c.phone AS phone,
                c.summary AS summary,
                c.role AS recommended_role,
                c.match_score AS match_score,
                candidate_skills AS skills

            ORDER BY c.match_score DESC

            LIMIT $limit
            """,
            skills=skills,
            role=role or "",
            limit=limit
        )

        candidates = []

        for record in result:

            candidates.append({
                "name": record["name"],
                "email": record["email"],
                "phone": record["phone"],
                "summary": record["summary"],
                "recommended_role": record["recommended_role"],
                "match_score": record["match_score"],
                "skills": record["skills"]
            })

        return candidates