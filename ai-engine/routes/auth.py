from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.state_store import state_store

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    target_career: str | None = "Full Stack Developer"

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: RegisterRequest):
    user_id = f"usr-{len(state_store.data['users']) + 1}"
    user_record = {
        "id": user_id,
        "email": req.email,
        "name": req.name,
        "role": "candidate",
        "created_at": "2026-03-01T10:00:00Z"
    }
    state_store.data["users"][req.email] = user_record
    state_store.data["profile"]["name"] = req.name
    state_store.data["profile"]["email"] = req.email
    if req.target_career:
        state_store.data["profile"]["target_career"] = req.target_career
    state_store.save()

    return {
        "token": f"jwt-token-{user_id}-session",
        "user": user_record
    }

@router.post("/login")
def login(req: LoginRequest):
    user = state_store.data["users"].get(req.email)
    if not user:
        # Create standard session
        user = {
            "id": "usr-default",
            "email": req.email,
            "name": req.email.split("@")[0].title(),
            "role": "candidate"
        }
    return {
        "token": f"jwt-token-{user['id']}-session",
        "user": user
    }

@router.get("/me")
def get_current_user():
    return {
        "user": list(state_store.data["users"].values())[0] if state_store.data["users"] else {
            "id": "usr-1",
            "name": "Alex Mercer",
            "email": "candidate@example.com",
            "role": "candidate"
        }
    }
