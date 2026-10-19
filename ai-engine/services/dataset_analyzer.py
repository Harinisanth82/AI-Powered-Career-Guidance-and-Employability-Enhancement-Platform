import pandas as pd
import numpy as np

def analyze_dataset_file(file_path: str) -> dict:
    """Analyzes a CSV or Excel dataset and extracts comprehensive statistical and structural metadata."""
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    elif file_path.endswith('.xlsx') or file_path.endswith('.xls'):
        df = pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format. Please upload CSV or Excel files.")

    num_rows, num_cols = df.shape
    columns = list(df.columns)
    
    # Missing values and duplicates
    missing_counts = df.isnull().sum().to_dict()
    total_missing = int(df.isnull().sum().sum())
    duplicate_rows = int(df.duplicated().sum())

    # Column inspection
    numerical_cols = []
    categorical_cols = []
    text_cols = []
    data_types = {}
    unique_counts = {}
    sample_values = {}

    for col in columns:
        dtype = str(df[col].dtype)
        data_types[col] = dtype
        n_unique = int(df[col].nunique())
        unique_counts[col] = n_unique
        # Pick 3 non-null sample values
        samples = [str(x) for x in df[col].dropna().head(3).tolist()]
        sample_values[col] = samples

        if pd.api.types.is_numeric_dtype(df[col]):
            numerical_cols.append(col)
        elif pd.api.types.is_string_dtype(df[col]) or dtype == 'object':
            if n_unique <= 25 or n_unique <= (num_rows * 0.3):
                categorical_cols.append(col)
            else:
                text_cols.append(col)
        else:
            categorical_cols.append(col)

    # Detect potential target columns
    # Targets are typically categorical or string columns with between 2 and 30 distinct values
    potential_targets = []
    target_keywords = ['career', 'role', 'target', 'job', 'position', 'label', 'track', 'field', 'profession']
    
    for col in columns:
        col_lower = col.lower()
        n_unique = unique_counts[col]
        # Priority if matches target keyword
        has_keyword = any(kw in col_lower for kw in target_keywords)
        if 2 <= n_unique <= 35:
            confidence = "High" if has_keyword else ("Medium" if col in categorical_cols else "Low")
            potential_targets.append({
                "column": col,
                "unique_classes": n_unique,
                "confidence": confidence,
                "is_keyword_match": has_keyword
            })

    # Sort potential targets by confidence
    potential_targets.sort(key=lambda x: (x["confidence"] == "High", x["confidence"] == "Medium", -x["unique_classes"]), reverse=True)

    # Class distributions for candidate targets
    class_distributions = {}
    for pt in potential_targets[:3]:
        tcol = pt["column"]
        top_classes = df[tcol].value_counts().head(15).to_dict()
        class_distributions[tcol] = {str(k): int(v) for k, v in top_classes.items()}

    # Feature mapping suggestions for common skills
    known_skill_keys = {
        "python": ["python", "py", "python_score", "python_skill"],
        "java": ["java", "java_skill", "java_score"],
        "javascript": ["javascript", "js", "web_js"],
        "react": ["react", "reactjs", "react_skill"],
        "nodejs": ["node", "nodejs", "node_js", "backend_node"],
        "sql": ["sql", "database", "rdbms", "sql_queries"],
        "mongodb": ["mongodb", "mongo", "nosql"],
        "machine_learning": ["machine_learning", "ml", "ml_score", "machinelearning"],
        "data_science": ["data_science", "ds", "analytics"],
        "linux": ["linux", "unix", "os"],
        "docker": ["docker", "containers"],
        "network_security": ["security", "network_security", "cybersecurity", "cyber"],
        "figma_ui": ["figma", "ui", "ux", "ui_ux", "design"],
        "cgpa": ["cgpa", "gpa", "academic_score", "grade", "percentage"],
        "problem_solving": ["problem_solving", "dsa", "logic", "coding"],
        "communication": ["communication", "soft_skills", "verbal"]
    }

    suggested_mapping = {}
    for canonical, synonyms in known_skill_keys.items():
        for col in columns:
            cleaned_col = col.lower().replace(" ", "_").replace("-", "_")
            if any(syn in cleaned_col for syn in synonyms):
                suggested_mapping[canonical] = col
                break

    return {
        "num_rows": num_rows,
        "num_columns": num_cols,
        "columns": columns,
        "data_types": data_types,
        "missing_counts": missing_counts,
        "total_missing": total_missing,
        "duplicate_rows": duplicate_rows,
        "unique_counts": unique_counts,
        "sample_values": sample_values,
        "numerical_columns": numerical_cols,
        "categorical_columns": categorical_cols,
        "text_columns": text_cols,
        "potential_targets": potential_targets,
        "class_distributions": class_distributions,
        "suggested_mapping": suggested_mapping,
        "is_supervised_ready": len(potential_targets) > 0
    }
