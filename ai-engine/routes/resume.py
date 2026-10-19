import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.resume_analyzer import ResumeAnalyzer
from services.state_store import state_store

router = APIRouter(prefix="/api/resume", tags=["Resume Analysis"])
analyzer = ResumeAnalyzer()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
RESUME_UPLOADS_DIR = os.path.join(DATA_DIR, "resumes")
os.makedirs(RESUME_UPLOADS_DIR, exist_ok=True)

@router.post("/analyze")
async def analyze_resume_pdf(
    file: UploadFile = File(...),
    target_career: str = Form("Full Stack Developer")
):
    filename = file.filename
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resume documents are supported.")

    file_path = os.path.join(RESUME_UPLOADS_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        results = analyzer.analyze_resume(file_path, target_career=target_career)
        results["filename"] = filename
        
        state_store.add_timeline_event(
            "resume",
            f"Resume Analyzed: {filename}",
            f"Identified {results['detected_skills_count']} technical skills with {results['skill_coverage_percentage']}% coverage for {target_career}."
        )
        state_store.save()
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse resume PDF: {str(e)}")
