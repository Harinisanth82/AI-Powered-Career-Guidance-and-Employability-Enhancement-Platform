from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.interview_engine import InterviewEngine
from services.state_store import state_store

router = APIRouter(prefix="/api/interviews", tags=["Interviews"])
engine = InterviewEngine()

class SessionRequest(BaseModel):
    career: str | None = None
    category: str | None = "All"
    limit: int | None = 5

class EvaluateRequest(BaseModel):
    question_id: str
    user_answer: str

@router.post("/sessions")
def create_interview_session(req: SessionRequest):
    career = req.career or state_store.data["profile"].get("target_career", "Full Stack Developer")
    questions = engine.get_questions_for_session(career, category=req.category or "All", limit=req.limit or 5)
    return {
        "career": career,
        "category": req.category or "All",
        "questions_count": len(questions),
        "questions": questions
    }

@router.post("/evaluate")
def evaluate_interview_answer(req: EvaluateRequest):
    eval_result = engine.evaluate_answer(req.question_id, req.user_answer)
    
    interview_record = {
        "id": f"int-{len(state_store.data['interviews']) + 1}",
        "question_id": req.question_id,
        "date": "2026-03-22",
        "overall_score": eval_result["overall_score"],
        "technical_score": eval_result["technical_score"],
        "relevance_score": eval_result["relevance_score"],
        "verdict": eval_result["verdict"]
    }
    state_store.data["interviews"].append(interview_record)
    state_store.add_timeline_event(
        "interview",
        f"Mock Interview Question Evaluated ({eval_result['verdict']})",
        f"Scored {eval_result['overall_score']}/100. Tech score: {eval_result['technical_score']}%, Relevance: {eval_result['relevance_score']}%."
    )
    state_store.save()

    return eval_result

@router.get("/history")
def get_interview_history():
    return state_store.data.get("interviews", [])
