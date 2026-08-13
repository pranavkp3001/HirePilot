import chromadb


# =========================================================
# CHROMADB SETUP
# =========================================================

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_or_create_collection(
    name="hirepilot_resumes"
)


# =========================================================
# STORE RESUME
# =========================================================

def add_resume(candidate, resume_text):
    """
    Store the complete resume in ChromaDB.

    The resume text is embedded automatically by ChromaDB
    and can later be searched using semantic similarity.
    """

    email = candidate.get("email", "").strip()

    if not email:
        raise ValueError("Candidate email is required.")

    collection.upsert(
        ids=[email],
        documents=[resume_text],
        metadatas=[
            {
                "name": candidate.get("name", ""),
                "email": email,
                "role": candidate.get(
                    "recommended_role",
                    ""
                ),
            }
        ],
    )

    print(
        f"✓ Resume stored in ChromaDB: "
        f"{candidate.get('name', 'Unknown')}"
    )


# =========================================================
# SEMANTIC SEARCH
# =========================================================

def search(query, n_results=5):
    """
    Perform semantic similarity search against resumes.
    """

    if not query or not query.strip():
        return {
            "ids": [[]],
            "documents": [[]],
            "metadatas": [[]],
            "distances": [[]],
        }

    total_documents = collection.count()

    if total_documents == 0:
        return {
            "ids": [[]],
            "documents": [[]],
            "metadatas": [[]],
            "distances": [[]],
        }

    n_results = min(
        n_results,
        total_documents
    )

    results = collection.query(
        query_texts=[query],
        n_results=n_results,
    )

    return results


# =========================================================
# GET RESUME BY EMAIL
# =========================================================

def get_resume(email):
    """
    Retrieve a specific resume from ChromaDB.
    """

    result = collection.get(
        ids=[email]
    )

    return result