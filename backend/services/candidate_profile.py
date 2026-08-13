from neo4j import GraphDatabase
from dotenv import load_dotenv
import os


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

URI = os.getenv("NEO4J_URI")
USERNAME = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")


# =========================================================
# NEO4J DRIVER
# =========================================================

driver = GraphDatabase.driver(
    URI,
    auth=(
        USERNAME,
        PASSWORD
    ),
    max_connection_pool_size=50,
)


# =========================================================
# GET CANDIDATE PROFILE
# =========================================================

def get_candidate_profile(email):

    with driver.session() as session:

        result = session.run(
            """
            MATCH (c:Candidate {email: $email})

            OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)

            OPTIONAL MATCH (c)-[:STUDIED_AT]->(clg:College)

            OPTIONAL MATCH (c)-[:BUILT]->(p:Project)

            OPTIONAL MATCH (p)-[:USES]->(t:Technology)

            RETURN
                c.name AS name,
                c.email AS email,
                c.phone AS phone,
                c.summary AS summary,
                c.role AS role,
                c.match_score AS match_score,

                collect(DISTINCT s.name) AS skills,

                collect(DISTINCT clg.name) AS colleges,

                collect(
                    DISTINCT {
                        title: p.title,
                        description: p.description
                    }
                ) AS projects,

                collect(DISTINCT t.name) AS technologies
            """,
            email=email
        )

        record = result.single()

        if not record:
            return None

        projects = [
            project
            for project in record["projects"]
            if project.get("title")
        ]

        return {
            "name": record["name"] or "",
            "email": record["email"] or "",
            "phone": record["phone"] or "",
            "summary": record["summary"] or "",
            "role": record["role"] or "",
            "match_score": record["match_score"] or 0,

            "skills": [
                skill
                for skill in record["skills"]
                if skill
            ],

            "colleges": [
                college
                for college in record["colleges"]
                if college
            ],

            "projects": projects,

            "technologies": [
                technology
                for technology in record["technologies"]
                if technology
            ],
        }


# =========================================================
# GET KNOWLEDGE GRAPH
# =========================================================

def get_candidate_graph(email):

    with driver.session() as session:

        result = session.run(
            """
            MATCH (c:Candidate {email: $email})

            OPTIONAL MATCH path1 =
                (c)-[:HAS_SKILL]->(s:Skill)

            OPTIONAL MATCH path2 =
                (c)-[:STUDIED_AT]->(clg:College)

            OPTIONAL MATCH path3 =
                (c)-[:BUILT]->(p:Project)

            OPTIONAL MATCH path4 =
                (p)-[:USES]->(t:Technology)

            WITH
                c,
                collect(path1) +
                collect(path2) +
                collect(path3) +
                collect(path4) AS paths

            UNWIND paths AS path

            UNWIND nodes(path) AS node

            WITH
                collect(
                    DISTINCT {
                        id: elementId(node),
                        label: labels(node)[0],
                        name:
                            CASE
                                WHEN node.name IS NOT NULL
                                THEN node.name
                                WHEN node.title IS NOT NULL
                                THEN node.title
                                ELSE c.name
                            END
                    }
                ) AS nodes,

                collect(
                    DISTINCT {
                        source: elementId(startNode(relationships(path)[0])),
                        target: elementId(endNode(relationships(path)[0])),
                        type: type(relationships(path)[0])
                    }
                ) AS relationships

            RETURN nodes, relationships
            """,
            email=email
        )

        record = result.single()

        if not record:
            return None

        nodes = record["nodes"]
        relationships = record["relationships"]

        # Remove invalid relationship entries
        relationships = [
            relationship
            for relationship in relationships
            if relationship["source"]
            and relationship["target"]
        ]

        return {
            "nodes": nodes,
            "relationships": relationships
        }