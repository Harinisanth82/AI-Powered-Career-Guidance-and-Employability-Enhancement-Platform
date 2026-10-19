from fastapi import APIRouter
from pydantic import BaseModel
from services.career_recommender import CareerRecommender
from services.career_model import CareerModelManager
from services.state_store import state_store

router = APIRouter(tags=["Assessment & Profile"])
model_manager = CareerModelManager()
recommender = CareerRecommender(model_manager)

class AssessmentSubmission(BaseModel):
    # Technical Ratings (1-10)
    java: int = 5
    python: int = 5
    c: int = 4
    cpp: int = 4
    javascript: int = 7
    react: int = 7
    nodejs: int = 6
    sql: int = 7
    mongodb: int = 6
    machine_learning: int = 4
    data_science: int = 4
    linux: int = 6
    docker: int = 5
    network_security: int = 4
    figma_ui: int = 5
    
    # Cognitive & Soft Skills (1-10)
    problem_solving: int = 8
    communication: int = 8
    leadership: int = 7
    
    # Academic & Background
    cgpa: float = 8.2
    certifications: int = 2
    internship_experience: int = 1
    project_experience: int = 3
    interest: str = "Web Development"
    preferred_domain: str = "Technology"
    work_style: str = "Collaborative Teamwork"
    career_values: str = "Continuous Learning & Growth"

class ProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    target_career: str | None = None
    education_level: str | None = None
    institution: str | None = None
    cgpa: float | None = None
    certifications_count: int | None = None
    skills: dict | None = None
    interests: str | None = None
    work_style: str | None = None
    career_values: str | None = None

@router.post("/api/assessment/submit")
def submit_assessment(data: AssessmentSubmission):
    candidate_dict = {
        "Java": data.java,
        "Python": data.python,
        "C": data.c,
        "CPP": data.cpp,
        "JavaScript": data.javascript,
        "React": data.react,
        "NodeJS": data.nodejs,
        "SQL": data.sql,
        "MongoDB": data.mongodb,
        "Machine_Learning": data.machine_learning,
        "Data_Science": data.data_science,
        "Linux": data.linux,
        "Docker": data.docker,
        "Network_Security": data.network_security,
        "Figma_UI": data.figma_ui,
        "Problem_Solving": data.problem_solving,
        "Communication": data.communication,
        "Leadership": data.leadership,
        "CGPA": data.cgpa,
        "Certifications": data.certifications,
        "Internship_Experience": data.internship_experience,
        "Project_Experience": data.project_experience,
        "Interest": data.interest,
        "Preferred_Domain": data.preferred_domain
    }

    # Run trained ML model
    prediction_result = recommender.recommend_careers(candidate_dict, top_n=5)
    top_career = prediction_result["recommendations"][0]["career"] if prediction_result["recommendations"] else "Full Stack Developer"

    # Update profile in store
    state_store.data["profile"]["target_career"] = top_career
    state_store.data["profile"]["cgpa"] = data.cgpa
    state_store.data["profile"]["certifications_count"] = data.certifications
    state_store.data["profile"]["interests"] = data.interest
    state_store.data["profile"]["work_style"] = data.work_style
    state_store.data["profile"]["career_values"] = data.career_values
    state_store.data["profile"]["skills"] = {
        "javascript": data.javascript,
        "react": data.react,
        "nodejs": data.nodejs,
        "sql": data.sql,
        "mongodb": data.mongodb,
        "python": data.python,
        "java": data.java,
        "linux": data.linux,
        "docker": data.docker,
        "machine_learning": data.machine_learning,
        "figma": data.figma_ui,
        "cpp": data.cpp,
        "network_security": data.network_security,
        "data_science": data.data_science
    }
    state_store.data["assessment_completed"] = True
    state_store.add_timeline_event(
        "assessment",
        "Assessment Evaluated by Custom ML Model",
        f"Top predicted career: {top_career} ({prediction_result['recommendations'][0]['score']}% match score)."
    )
    state_store.save()

    return {
        "status": "success",
        "top_career": top_career,
        "recommendations": prediction_result["recommendations"],
        "model_used": prediction_result["model_used"],
        "model_accuracy": prediction_result["model_accuracy"]
    }

@router.get("/api/profile")
def get_profile():
    return state_store.data["profile"]

@router.put("/api/profile")
def update_profile(update: ProfileUpdate):
    for k, v in update.model_dump(exclude_none=True).items():
        state_store.data["profile"][k] = v
    state_store.save()
    return state_store.data["profile"]
