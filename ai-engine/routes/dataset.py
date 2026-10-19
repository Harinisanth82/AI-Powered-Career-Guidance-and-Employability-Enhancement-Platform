import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.dataset_analyzer import analyze_dataset_file
from services.state_store import state_store

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    filename = file.filename
    if not (filename.endswith('.csv') or filename.endswith('.xlsx') or filename.endswith('.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Only CSV and Excel (.xlsx) files are supported.")

    file_path = os.path.join(UPLOADS_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        analysis = analyze_dataset_file(file_path)
        analysis["file_name"] = filename
        analysis["file_path"] = file_path
        state_store.data["latest_dataset_analysis"] = analysis
        state_store.add_timeline_event(
            "dataset",
            f"Dataset Uploaded: {filename}",
            f"Parsed {analysis['num_rows']} records across {analysis['num_columns']} columns. Feature detection completed."
        )
        state_store.save()
        return analysis
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to analyze dataset: {str(e)}")

@router.get("/analysis")
def get_dataset_analysis():
    # If a custom uploaded analysis exists, return it; otherwise analyze the sample career dataset
    if state_store.data.get("latest_dataset_analysis"):
        return state_store.data["latest_dataset_analysis"]

    sample_csv = os.path.join(DATA_DIR, "sample_career_dataset.csv")
    if os.path.exists(sample_csv):
        analysis = analyze_dataset_file(sample_csv)
        analysis["file_name"] = "sample_career_dataset.csv"
        analysis["file_path"] = sample_csv
        state_store.data["latest_dataset_analysis"] = analysis
        state_store.save()
        return analysis

    raise HTTPException(status_code=404, detail="No dataset currently loaded. Please upload a dataset file.")
