from fastapi import APIRouter, UploadFile, File
import shutil
import os

from services.parser import extract_resume_text
from services.gemini import analyze_resume
from services.neo4j_service import store_candidate
from rag.vector_store import add_resume

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_resumes(files: list[UploadFile] = File(...)):

    uploaded_candidates = []
    failed_candidates = []

    for file in files:

        try:

            if not file.filename.lower().endswith(".pdf"):
                failed_candidates.append({
                    "file": file.filename,
                    "error": "Only PDF files are allowed."
                })
                continue

            file_path = os.path.join(UPLOAD_DIR, file.filename)

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            print(f"\n========== PROCESSING {file.filename} ==========")

            resume_text = extract_resume_text(file_path)

            if not resume_text.strip():
                failed_candidates.append({
                    "file": file.filename,
                    "error": "Could not extract resume text."
                })
                continue

            candidate = analyze_resume(resume_text)

            # Store in Neo4j
            store_candidate(candidate)

            # Store in ChromaDB
            add_resume(candidate, resume_text)

            uploaded_candidates.append(candidate)

            print(f"✓ Finished {candidate['name']}")

        except Exception as e:

            print(f"\n✗ Failed processing {file.filename}")
            print(e)

            failed_candidates.append({
                "file": file.filename,
                "error": str(e)
            })

            continue

    print("\n========== UPLOAD SUMMARY ==========")
    print(f"Successful : {len(uploaded_candidates)}")
    print(f"Failed     : {len(failed_candidates)}")
    print("====================================\n")

    return {
        "success": True,
        "count": len(uploaded_candidates),
        "failed_count": len(failed_candidates),
        "candidates": uploaded_candidates,
        "failed": failed_candidates
    }