from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"

print("Loading embedding model...")

model = SentenceTransformer(MODEL_NAME)

print("Embedding model loaded.")


def create_embedding(text: str):
    """
    Converts text into a vector embedding.
    """

    return model.encode(text).tolist()