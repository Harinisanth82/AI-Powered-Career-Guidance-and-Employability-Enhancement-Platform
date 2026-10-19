import os
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.career_model import CareerModelManager
from services.state_store import state_store

router = APIRouter(prefix="/api/model", tags=["Model Training"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
model_manager = CareerModelManager()

class TrainRequest(BaseModel):
    file_path: str | None = None
    target_column: str | None = "Career"
    feature_mappings: dict | None = None

@router.post("/train")
def train_model(req: TrainRequest):
    # Determine which file to train on
    dataset_path = req.file_path
    if not dataset_path:
        if state_store.data.get("latest_dataset_analysis"):
            dataset_path = state_store.data["latest_dataset_analysis"].get("file_path")
        if not dataset_path or not os.path.exists(dataset_path):
            dataset_path = os.path.join(DATA_DIR, "sample_career_dataset.csv")

    if not os.path.exists(dataset_path):
        raise HTTPException(status_code=400, detail="Dataset file not found. Upload a dataset first.")

    try:
        if dataset_path.endswith('.csv'):
            df = pd.read_csv(dataset_path)
        else:
            df = pd.read_excel(dataset_path)

        target_col = req.target_column or "Career"
        dataset_name = os.path.basename(dataset_path)

        metadata = model_manager.train_models(df, target_col, dataset_name=dataset_name)

        state_store.add_timeline_event(
            "model_trained",
            f"ML Model Retrained: {metadata['model_name']}",
            f"Achieved {metadata['accuracy']}% accuracy, F1: {metadata['f1_score']}%. Active version: {metadata['model_version']}."
        )

        return {
            "status": "success",
            "message": f"Successfully trained and evaluated models. Selected best model: {metadata['model_name']}.",
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status")
def get_model_status():
    if model_manager.active_model and model_manager.model_metadata:
        return {
            "is_trained": True,
            "model_name": model_manager.model_metadata.get("model_name"),
            "model_version": model_manager.model_metadata.get("model_version"),
            "training_date": model_manager.model_metadata.get("training_date"),
            "accuracy": model_manager.model_metadata.get("accuracy"),
            "f1_score": model_manager.model_metadata.get("f1_score"),
            "classes_count": len(model_manager.model_metadata.get("career_classes", []))
        }
    return {
        "is_trained": False,
        "message": "No model currently active. Train a model from the Admin tab."
    }

@router.get("/metrics")
def get_model_metrics():
    if not model_manager.model_metadata:
        model_manager.load_active_model()

    if not model_manager.model_metadata:
        raise HTTPException(status_code=404, detail="No model metrics available. Please train a model first.")

    return model_manager.model_metadata
