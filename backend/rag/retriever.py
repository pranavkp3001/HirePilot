from rag.vector_store import search


def retrieve(query):

    results = search(query)

    return results