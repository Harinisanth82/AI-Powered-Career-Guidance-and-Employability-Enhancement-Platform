from fastapi import APIRouter
from services.insight_engine import InsightEngine
from services.skill_gap_engine import SkillGapEngine
from services.state_store import state_store
from utils.scoring import calculate_employability_index

router = APIRouter(tags=["Insights & Market Data"])
insight_engine = InsightEngine()
gap_engine = SkillGapEngine()

@router.get("/api/insights")
def get_candidate_insights():
    target = state_store.data["profile"].get("target_career", "Full Stack Developer")
    user_skills = state_store.data["profile"].get("skills", {})
    gap = gap_engine.analyze_gap(target.lower().replace(" ", "-"), user_skills)

    # Calculate current score
    milestones = state_store.data.get("roadmap", [])
    roadmap_score = 30.0 if not milestones else (sum(1 for m in milestones if m.get("status") == "Completed") / len(milestones)) * 100
    proof_score = min(100.0, len(state_store.data.get("proofs", [])) * 45.0 + 10.0)
    interviews = state_store.data.get("interviews", [])
    int_score = 65.0 if not interviews else sum(i.get("overall_score", 65.0) for i in interviews) / len(interviews)
    
    emp_res = calculate_employability_index(gap["skill_coverage_percentage"], roadmap_score, proof_score, int_score)

    insights = insight_engine.generate_candidate_insights(
        profile=state_store.data["profile"],
        top_career=target,
        gap_analysis=gap,
        employability_score=emp_res["score"]
    )

    return {
        "candidate_insights": insights,
        "primary_focus_career": target,
        "readiness_index": emp_res["score"],
        "critical_gap_summary": [g["name"] for g in gap.get("critical_gaps", [])]
    }

@router.get("/api/market/insights")
def get_market_insights():
    return insight_engine.get_market_dataset_insights(None)
