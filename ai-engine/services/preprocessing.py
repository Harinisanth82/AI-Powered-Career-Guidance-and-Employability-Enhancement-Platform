import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib

class CareerDataPreprocessor:
    def __init__(self):
        self.pipeline = None
        self.target_encoder = None
        self.numerical_cols = []
        self.categorical_cols = []
        self.feature_names = []
        self.classes_ = []

    def fit_transform(self, df: pd.DataFrame, target_col: str):
        X = df.drop(columns=[target_col])
        y = df[target_col].astype(str)

        # Detect column types
        self.numerical_cols = list(X.select_dtypes(include=[np.number]).columns)
        self.categorical_cols = list(X.select_dtypes(exclude=[np.number]).columns)

        num_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])

        cat_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])

        transformers = []
        if self.numerical_cols:
            transformers.append(('num', num_transformer, self.numerical_cols))
        if self.categorical_cols:
            transformers.append(('cat', cat_transformer, self.categorical_cols))

        self.pipeline = ColumnTransformer(transformers=transformers, remainder='drop')
        X_trans = self.pipeline.fit_transform(X)

        # Get transformed feature names
        all_features = []
        if self.numerical_cols:
            all_features.extend(self.numerical_cols)
        if self.categorical_cols:
            cat_encoder = self.pipeline.named_transformers_['cat'].named_steps['onehot']
            cat_feat_names = cat_encoder.get_feature_names_out(self.categorical_cols)
            all_features.extend(list(cat_feat_names))
        self.feature_names = all_features

        # Encode target classes
        self.classes_ = sorted(list(y.unique()))
        y_encoded = np.array([self.classes_.index(val) for val in y])

        return X_trans, y_encoded, self.classes_

    def transform_single(self, input_dict: dict) -> np.ndarray:
        """Transforms a single candidate record dictionary into scaled feature vector."""
        df_row = pd.DataFrame([input_dict])
        # Ensure all expected columns exist
        for col in self.numerical_cols:
            if col not in df_row.columns:
                df_row[col] = 0.0
            else:
                df_row[col] = pd.to_numeric(df_row[col], errors='coerce').fillna(0.0)

        for col in self.categorical_cols:
            if col not in df_row.columns:
                df_row[col] = "Unknown"
            else:
                df_row[col] = str(df_row[col])

        return self.pipeline.transform(df_row)

    def save(self, filepath: str):
        joblib.dump({
            "pipeline": self.pipeline,
            "numerical_cols": self.numerical_cols,
            "categorical_cols": self.categorical_cols,
            "feature_names": self.feature_names,
            "classes_": self.classes_
        }, filepath)

    @classmethod
    def load(cls, filepath: str):
        data = joblib.load(filepath)
        obj = cls()
        obj.pipeline = data["pipeline"]
        obj.numerical_cols = data["numerical_cols"]
        obj.categorical_cols = data["categorical_cols"]
        obj.feature_names = data["feature_names"]
        obj.classes_ = data["classes_"]
        return obj
