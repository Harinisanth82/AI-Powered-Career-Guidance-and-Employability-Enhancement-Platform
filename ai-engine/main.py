import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.dataset import router as dataset_router
from routes.training import router as training_router
from routes.assessment import router as assessment_router
from routes.careers import router as careers_router
from routes.skills import router as skills_router
from routes.roadmap import router as roadmap_router
from routes.projects import router as projects_router
from routes.interviews import router as interviews_router
from routes.resume import router as resume_router
from routes.employability import router as employability_router
from routes.insights import router as insights_router
from services.career_model import CareerModelManager

app = FastAPI(
    title="AI-Based Career Guidance & Employability Framework",
    description="Domain-specific AI/ML Career Intelligence, NLP, and Recommendation Engine",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route blueprints
app.include_router(auth_router)
app.include_router(dataset_router)
app.include_router(training_router)
app.include_router(assessment_router)
app.include_router(careers_router)
app.include_router(skills_router)
app.include_router(roadmap_router)
app.include_router(projects_router)
app.include_router(interviews_router)
app.include_router(resume_router)
app.include_router(employability_router)
app.include_router(insights_router)

@app.on_event("startup")
def startup_event():
    """Initializes models on startup if not already trained."""
    mgr = CareerModelManager()
    if not mgr.active_model:
        csv_path = os.path.join(os.path.dirname(__file__), "data", "sample_career_dataset.csv")
        if os.path.exists(csv_path):
            try:
                print("Training initial benchmark model on sample career dataset...")
                df = pd.read_csv(csv_path)
                meta = mgr.train_models(df, "Career", dataset_name="sample_career_dataset.csv")
                print(f"Initial model successfully trained: {meta['model_name']} ({meta['accuracy']}% accuracy, F1: {meta['f1_score']}%)")
            except Exception as e:
                print(f"Startup model training warning: {e}")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AI-Based Career Guidance Framework AI Engine",
        "architecture": "Python FastAPI + Scikit-Learn + NLP",
        "llm_dependency": False,
        "engine_type": "Domain-Specific Custom Machine Learning & NLP"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "engine": "FastAPI AI Engine",
        "port": 5000
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=False)
