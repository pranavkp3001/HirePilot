from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.resume import router as resume_router
from routes.match import router as match_router
from routes.rag import router as rag_router
from routes.profile import router as profile_router


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="HirePilot API",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def root():

    return {
        "message": "Welcome to HirePilot API 🚀"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# =========================================================
# RESUME UPLOAD
# =========================================================

app.include_router(
    resume_router,
    prefix="/api",
    tags=["Resume"]
)


# =========================================================
# JD MATCHER
# =========================================================

app.include_router(
    match_router,
    prefix="/api",
    tags=["JD Matcher"]
)


# =========================================================
# RAG SEARCH
# =========================================================

app.include_router(
    rag_router,
    prefix="/api",
    tags=["RAG"]
)


# =========================================================
# CANDIDATE PROFILE
# =========================================================

app.include_router(
    profile_router,
    prefix="/api/candidates",
    tags=["Candidate Profile"]
)