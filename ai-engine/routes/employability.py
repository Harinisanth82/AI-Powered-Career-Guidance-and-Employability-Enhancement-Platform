from fastapi import APIRouter
from utils.scoring import calculate_employability_index
from services.skill_gap_engine import SkillGapEngine
from services.state_store import state_store

router = APIRouter(prefix="/api/progress", tags=["Employability & Progress"])
gap_engine = SkillGapEngine()

@router.get("/employability")
def get_employability_index():
    target = state_store.data["profile"].get("target_career", "Full Stack Developer")
    user_skills = state_store.data["profile"].get("skills", {})
    
    # 1. Skill Mastery (35%)
    gap = gap_engine.analyze_gap(target.lower().replace(" ", "-"), user_skills)
    skill_mastery_score = gap["skill_coverage_percentage"]

    # 2. Roadmap Completion (25%)
    milestones = state_store.data.get("roadmap", [])
    if milestones:
        completed_m = sum(1 for m in milestones if m.get("status") == "Completed")
        roadmap_score = round((completed_m / len(milestones)) * 100, 1)
    else:
        roadmap_score = 30.0

    # 3. Proof of Skills & Projects (25%)
    proofs = state_store.data.get("proofs", [])
    verified_proofs = sum(1 for p in proofs if p.get("verified"))
    # Each verified proof counts up to 40% towards this category (up to 100)
    proof_score = min(100.0, verified_proofs * 45.0 + 10.0)

    # 4. Mock Interview Performance (15%)
    interviews = state_store.data.get("interviews", [])
    if interviews:
        avg_int = sum(i.get("overall_score", 60.0) for i in interviews) / len(interviews)
        interview_score = round(avg_int, 1)
    else:
        interview_score = 65.0

    result = calculate_employability_index(
        skill_mastery=skill_mastery_score,
        roadmap_completion=roadmap_score,
        proof_projects=proof_score,
        interview_performance=interview_score
    )

    result["target_career"] = target
    result["metrics_summary"] = {
        "mastered_skills_count": len(gap.get("mastered_skills", [])),
        "developing_skills_count": len(gap.get("developing_skills", [])),
        "critical_gaps_count": len(gap.get("critical_gaps", [])),
        "completed_milestones": sum(1 for m in milestones if m.get("status") == "Completed"),
        "total_milestones": len(milestones),
        "verified_proofs_count": verified_proofs,
        "completed_interviews_count": len(interviews)
    }

    return result

@router.get("/timeline")
def get_progress_timeline():
    return state_store.data.get("timeline", [])
