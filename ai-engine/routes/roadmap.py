from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.roadmap_engine import RoadmapEngine
from services.skill_gap_engine import SkillGapEngine
from services.state_store import state_store

router = APIRouter(prefix="/api/roadmap", tags=["Roadmap"])

roadmap_engine = RoadmapEngine()
gap_engine = SkillGapEngine()

class StatusUpdate(BaseModel):
    status: str  # "Pending", "In Progress", "Completed"

@router.get("")
def get_roadmap():
    if state_store.data.get("roadmap") and len(state_store.data["roadmap"]) > 0:
        return state_store.data["roadmap"]

    # Generate default roadmap from user target career
    target = state_store.data["profile"].get("target_career", "Full Stack Developer")
    user_skills = state_store.data["profile"].get("skills", {})
    gap = gap_engine.analyze_gap(target.lower().replace(" ", "-"), user_skills)
    generated = roadmap_engine.generate_roadmap(target, gap)
    state_store.data["roadmap"] = generated
    state_store.save()
    return generated

@router.post("/generate")
def generate_new_roadmap(career_id: str | None = None):
    target = career_id or state_store.data["profile"].get("target_career", "Full Stack Developer")
    user_skills = state_store.data["profile"].get("skills", {})
    gap = gap_engine.analyze_gap(target.lower().replace(" ", "-"), user_skills)
    generated = roadmap_engine.generate_roadmap(target, gap)
    state_store.data["roadmap"] = generated
    state_store.add_timeline_event(
        "roadmap",
        f"Learning Roadmap Initialized for {target}",
        f"Created {len(generated)} structured learning milestones with prerequisite sequencing."
    )
    state_store.save()
    return generated

@router.patch("/milestones/{milestone_id}")
def update_milestone_status(milestone_id: str, update: StatusUpdate):
    milestones = state_store.data.get("roadmap", [])
    found = False
    for m in milestones:
        if m["id"] == milestone_id:
            m["status"] = update.status
            found = True
            if update.status == "Completed":
                state_store.add_timeline_event(
                    "milestone_completed",
                    f"Milestone Completed: {m['title']}",
                    f"Completed learning milestone and project tasks for: {', '.join(m['skills'])}."
                )
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Milestone '{milestone_id}' not found.")

    state_store.save()
    return {"status": "success", "milestones": milestones}
