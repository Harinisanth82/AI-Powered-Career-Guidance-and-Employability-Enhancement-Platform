import json
import os
from fastapi import APIRouter, HTTPException, Query
from services.skill_gap_engine import SkillGapEngine
from services.career_recommender import CareerRecommender
from services.career_model import CareerModelManager
from services.state_store import state_store

router = APIRouter(prefix="/api/careers", tags=["Careers"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
gap_engine = SkillGapEngine()
model_manager = CareerModelManager()
recommender = CareerRecommender(model_manager)

with open(os.path.join(DATA_DIR, "careers.json"), "r") as f:
    CAREERS_CATALOG = json.load(f)

@router.get("/catalog")
def get_career_catalog():
    return CAREERS_CATALOG

@router.get("/catalog/{career_id}")
def get_career_detail(career_id: str):
    career = next((c for c in CAREERS_CATALOG if c["id"] == career_id or c["career"].lower().replace(" ", "-") == career_id), None)
    if not career:
        raise HTTPException(status_code=404, detail=f"Career '{career_id}' not found.")
    return career

@router.get("/catalog/{career_id}/compare")
def compare_career_with_profile(career_id: str):
    career = next((c for c in CAREERS_CATALOG if c["id"] == career_id or c["career"].lower().replace(" ", "-") == career_id), None)
    if not career:
        raise HTTPException(status_code=404, detail=f"Career '{career_id}' not found.")

    profile_skills = state_store.data["profile"].get("skills", {})
    gap = gap_engine.analyze_gap(career["id"], profile_skills)

    return {
        "career": career,
        "gap_analysis": gap,
        "candidate_skills": profile_skills
    }

@router.get("/gap-analysis")
def get_gap_analysis(career_id: str | None = None):
    target = career_id or state_store.data["profile"].get("target_career", "Full Stack Developer")
    target_slug = target.lower().replace(" ", "-")
    profile_skills = state_store.data["profile"].get("skills", {})
    return gap_engine.analyze_gap(target_slug, profile_skills)

@router.post("/predict")
def predict_career(candidate_data: dict):
    return recommender.recommend_careers(candidate_data, top_n=5)
