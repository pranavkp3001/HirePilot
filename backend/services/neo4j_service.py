from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

load_dotenv()

URI = os.getenv("NEO4J_URI")
USERNAME = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(
    URI,
    auth=(USERNAME, PASSWORD),
    max_connection_pool_size=50,
)


def store_candidate(candidate):

    print("\n========== STORING CANDIDATE ==========")

    with driver.session() as session:

        session.execute_write(_store_candidate_tx, candidate)

    print("========== SUCCESS ==========\n")


def _store_candidate_tx(tx, candidate):

    email = candidate.get("email", "")

    tx.run(
        """
        MERGE (c:Candidate {email:$email})
        SET c.name=$name,
            c.phone=$phone,
            c.summary=$summary,
            c.role=$role,
            c.match_score=$score
        """,
        email=email,
        name=candidate.get("name", ""),
        phone=candidate.get("phone", ""),
        summary=candidate.get("summary", ""),
        role=candidate.get("recommended_role", ""),
        score=candidate.get("match_score", 0),
    )

    skills = candidate.get("skills", [])

    tx.run(
        """
        MATCH (c:Candidate {email:$email})

        UNWIND $skills AS skill

        MERGE (s:Skill {name:skill})

        MERGE (c)-[:HAS_SKILL]->(s)
        """,
        email=email,
        skills=skills,
    )

    education = [
        edu.get("college", "")
        for edu in candidate.get("education", [])
        if edu.get("college")
    ]

    tx.run(
        """
        MATCH (c:Candidate {email:$email})

        UNWIND $colleges AS college

        MERGE (clg:College {name:college})

        MERGE (c)-[:STUDIED_AT]->(clg)
        """,
        email=email,
        colleges=education,
    )

    projects = []

    technologies = []

    for project in candidate.get("projects", []):

        title = project.get("title", "")

        projects.append(
            {
                "title": title,
                "description": project.get("description", ""),
            }
        )

        for tech in project.get("tech_stack", []):

            technologies.append(
                {
                    "title": title,
                    "tech": tech,
                }
            )

    tx.run(
        """
        MATCH (c:Candidate {email:$email})

        UNWIND $projects AS p

        MERGE (proj:Project {title:p.title})

        SET proj.description = p.description

        MERGE (c)-[:BUILT]->(proj)
        """,
        email=email,
        projects=projects,
    )

    tx.run(
        """
        UNWIND $techs AS item

        MATCH (p:Project {title:item.title})

        MERGE (t:Technology {name:item.tech})

        MERGE (p)-[:USES]->(t)
        """,
        techs=technologies,
    )

    print(f"✓ Candidate stored")
    print(f"✓ Stored {len(skills)} skills")
    print(f"✓ Stored {len(education)} colleges")
    print(f"✓ Stored {len(projects)} projects")
    print(f"✓ Stored {len(technologies)} technologies")