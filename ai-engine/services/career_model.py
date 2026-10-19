import os
import json
import datetime
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from services.preprocessing import CareerDataPreprocessor

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

class CareerModelManager:
    def __init__(self):
        self.preprocessor = None
        self.active_model = None
        self.model_metadata = {}
        self.load_active_model()

    def train_models(self, df: pd.DataFrame, target_col: str, dataset_name: str = "custom_dataset.csv") -> dict:
        """
        Trains and compares multiple genuine ML classifiers:
        - Logistic Regression
        - Decision Tree
        - Random Forest
        - Gradient Boosting
        Evaluates real metrics and activates the best model.
        """
        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found in dataset.")

        # Clean target: drop NaN rows in target
        df_clean = df.dropna(subset=[target_col]).copy()
        if len(df_clean) < 15:
            raise ValueError("Dataset must contain at least 15 rows for reliable model training.")

        unique_targets = df_clean[target_col].nunique()
        if unique_targets < 2:
            raise ValueError(f"The target column '{target_col}' has only {unique_targets} unique class. Supervised learning requires at least 2 distinct classes.")

        # Preprocess data
        prep = CareerDataPreprocessor()
        X, y, classes = prep.fit_transform(df_clean, target_col)

        # Stratified train/test split if possible
        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.25, random_state=42, stratify=y
            )
        except Exception:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.25, random_state=42
            )

        # Candidates to evaluate
        candidate_models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
            "Decision Tree": DecisionTreeClassifier(max_depth=12, random_state=42),
            "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=14, random_state=42),
            "Gradient Boosting": GradientBoostingClassifier(n_estimators=75, max_depth=5, random_state=42)
        }

        results = {}
        best_model_name = None
        best_f1 = -1.0
        best_model_obj = None

        for name, clf in candidate_models.items():
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
            rec = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
            f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
            cm = confusion_matrix(y_test, y_pred).tolist()

            results[name] = {
                "accuracy": round(acc * 100, 2),
                "precision": round(prec * 100, 2),
                "recall": round(rec * 100, 2),
                "f1_score": round(f1 * 100, 2),
                "confusion_matrix": cm
            }

            if f1 > best_f1:
                best_f1 = f1
                best_model_name = name
                best_model_obj = clf

        # Feature importances for the best model if supported
        feature_importances = {}
        if hasattr(best_model_obj, "feature_importances_"):
            importances = best_model_obj.feature_importances_
            feat_imp_pairs = sorted(zip(prep.feature_names, importances), key=lambda x: x[1], reverse=True)
            feature_importances = {k: round(float(v) * 100, 2) for k, v in feat_imp_pairs[:12]}
        elif hasattr(best_model_obj, "coef_"):
            coef_mag = np.mean(np.abs(best_model_obj.coef_), axis=0)
            feat_imp_pairs = sorted(zip(prep.feature_names, coef_mag), key=lambda x: x[1], reverse=True)
            norm_max = max(feat_imp_pairs[0][1], 1e-6)
            feature_importances = {k: round(float(v / norm_max) * 100, 2) for k, v in feat_imp_pairs[:12]}

        # Save artifacts
        model_path = os.path.join(MODELS_DIR, "career_model.pkl")
        prep_path = os.path.join(MODELS_DIR, "preprocessing.pkl")
        meta_path = os.path.join(MODELS_DIR, "metadata.json")

        joblib.dump(best_model_obj, model_path)
        prep.save(prep_path)

        metadata = {
            "model_name": best_model_name,
            "model_version": f"v{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
            "training_date": datetime.datetime.now().isoformat(),
            "dataset_name": dataset_name,
            "dataset_size": int(len(df_clean)),
            "feature_count": len(prep.feature_names),
            "target_column": target_col,
            "accuracy": results[best_model_name]["accuracy"],
            "precision": results[best_model_name]["precision"],
            "recall": results[best_model_name]["recall"],
            "f1_score": results[best_model_name]["f1_score"],
            "career_classes": classes,
            "all_model_evaluations": results,
            "feature_importances": feature_importances
        }

        with open(meta_path, "w") as f:
            json.dump(metadata, f, indent=2)

        self.preprocessor = prep
        self.active_model = best_model_obj
        self.model_metadata = metadata

        return metadata

    def load_active_model(self):
        """Loads saved models from disk if present."""
        model_path = os.path.join(MODELS_DIR, "career_model.pkl")
        prep_path = os.path.join(MODELS_DIR, "preprocessing.pkl")
        meta_path = os.path.join(MODELS_DIR, "metadata.json")

        if os.path.exists(model_path) and os.path.exists(prep_path) and os.path.exists(meta_path):
            try:
                self.active_model = joblib.load(model_path)
                self.preprocessor = CareerDataPreprocessor.load(prep_path)
                with open(meta_path, "r") as f:
                    self.model_metadata = json.load(f)
                return True
            except Exception as e:
                print(f"Error loading active model: {e}")
                return False
        return False
