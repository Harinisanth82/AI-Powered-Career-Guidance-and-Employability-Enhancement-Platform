import os

ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.pdf'}
MAX_DATASET_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB
MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024   # 10 MB

def validate_uploaded_file(filename: str, file_size: int, allowed_types: set[str] = ALLOWED_EXTENSIONS) -> tuple[bool, str]:
    if not filename:
        return False, "File name cannot be empty."
    _, ext = os.path.splitext(filename.lower())
    if ext not in allowed_types:
        return False, f"Unsupported file format '{ext}'. Allowed formats: {', '.join(allowed_types)}"
    if file_size > MAX_DATASET_SIZE_BYTES:
        return False, f"File size exceeds maximum permitted limit ({MAX_DATASET_SIZE_BYTES // (1024*1024)}MB)."
    return True, "File is valid."
