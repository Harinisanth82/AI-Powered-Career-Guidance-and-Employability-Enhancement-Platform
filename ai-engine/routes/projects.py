import json
import os
from fastapi import APIRouter
from services.project_recommender import ProjectRecommender
from services.skill_gap_engine import SkillGapEngine
from services.state_store import state_store

router = APIRouter(tags=["Projects & Learning Resources"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
project_recommender = ProjectRecommender()
gap_engine = SkillGapEngine()

with open(os.path.join(DATA_DIR, "projects.json"), "r") as f:
    ALL_PROJECTS = json.load(f)

with open(os.path.join(DATA_DIR, "learning_resources.json"), "r") as f:
    ALL_RESOURCES = json.load(f)

@router.get("/api/projects/catalog")
def get_projects_catalog():
    return ALL_PROJECTS

@router.get("/api/projects/recommended")
def get_recommended_projects(career: str | None = None):
    target = career or state_store.data["profile"].get("target_career", "Full Stack Developer")
    user_skills = state_store.data["profile"].get("skills", {})
    gap = gap_engine.analyze_gap(target.lower().replace(" ", "-"), user_skills)
    missing = [g["name"] for g in gap.get("critical_gaps", [])] + [g["name"] for g in gap.get("developing_skills", [])]
    return project_recommender.recommend_projects(target, user_skills, missing)

@router.get("/api/learning/resources")
def get_learning_resources(skill: str | None = None, career: str | None = None):
    if not skill and not career:
        return ALL_RESOURCES
    res = ALL_RESOURCES
    if skill:
        res = [r for r in res if skill.lower() in r["skill"].lower()]
    if career:
        res = [r for r in res if career.lower() in r["career"].lower()]
    return res if res else ALL_RESOURCES[:6]
