import os
import json
import glob
import time
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split

from services.data_service import DataService
from models.ml_engine import MLEngine, ALGORITHM_DISPLAY_NAMES
from utils.helpers import sanitize_json, generate_id

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models_storage')
os.makedirs(MODELS_DIR, exist_ok=True)

class ModelService:
    @staticmethod
    def train_model(config):
        dataset_id = config.get('dataset_id')
        if not dataset_id:
            raise ValueError("Dataset ID is required.")

        target_col = config.get('target_column')
        if not target_col:
            raise ValueError("Target column is required.")

        problem_type = config.get('problem_type', 'classification').lower()
        algo_key = config.get('algorithm', 'logistic_regression' if problem_type == 'classification' else 'linear_regression').lower()
        test_size = float(config.get('test_size', 0.2))
        random_state = int(config.get('random_state', 42))
        hyperparams = config.get('hyperparams', {})
        preprocess_config = config.get('preprocessing', {})
        preprocess_config['target_column'] = target_col

        # 1. Load dataset
        df = DataService.load_dataset(dataset_id)
        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found in dataset.")

        # Check problem type validity
        if problem_type == 'classification':
            unique_targets = df[target_col].nunique()
            if unique_targets > 50 and pd.api.types.is_numeric_dtype(df[target_col]):
                # Warning: high cardinality target for classification
                pass

        # 2. Preprocess dataset
        df_processed, prep_summary, prep_artifacts = DataService.preprocess_data(df, preprocess_config)

        if target_col not in df_processed.columns:
            raise ValueError(f"Target column '{target_col}' was removed during preprocessing.")

        X = df_processed.drop(columns=[target_col])
        y = df_processed[target_col]

        if len(X.columns) == 0:
            raise ValueError("No input feature columns remaining after preprocessing.")

        feature_names = list(X.columns)

        # 3. Train-Test Split
        stratify = None
        if problem_type == 'classification':
            # Only stratify if all classes have at least 2 samples
            counts = y.value_counts()
            if (counts >= 2).all() and len(counts) > 1:
                stratify = y

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=stratify
        )

        # 4. Instantiate Model & Train
        start_time = time.time()
        model = MLEngine.build_model(problem_type, algo_key, hyperparams)
        eval_results = MLEngine.train_and_evaluate(
            model, X_train, X_test, y_train, y_test, problem_type, feature_names=feature_names
        )
        training_duration_ms = round((time.time() - start_time) * 1000, 2)

        # 5. Persist Model and Pipeline artifacts
        model_id = generate_id("model")
        model_filename = f"{model_id}.joblib"
        model_path = os.path.join(MODELS_DIR, model_filename)

        model_artifact = {
            'model': model,
            'model_id': model_id,
            'dataset_id': dataset_id,
            'target_column': target_col,
            'problem_type': problem_type,
            'algorithm': algo_key,
            'algorithm_name': ALGORITHM_DISPLAY_NAMES.get(algo_key, algo_key.replace('_', ' ').title()),
            'feature_names': feature_names,
            'feature_info': [{
                'name': col,
                'type': 'numerical' if pd.api.types.is_numeric_dtype(X[col]) else 'categorical',
                'min': float(X[col].min()) if pd.api.types.is_numeric_dtype(X[col]) else None,
                'max': float(X[col].max()) if pd.api.types.is_numeric_dtype(X[col]) else None,
                'mean': float(X[col].mean()) if pd.api.types.is_numeric_dtype(X[col]) else None,
                'sample': X[col].iloc[0] if len(X) > 0 else None
            } for col in feature_names],
            'prep_artifacts': prep_artifacts,
            'eval_results': eval_results,
            'created_at': datetime.now().isoformat(),
            'training_time_ms': training_duration_ms
        }

        joblib.dump(model_artifact, model_path)

        # Also save JSON metadata for fast listing
        meta_path = os.path.join(MODELS_DIR, f"{model_id}.json")
        meta_to_save = {
            'model_id': model_id,
            'name': f"{ALGORITHM_DISPLAY_NAMES.get(algo_key, algo_key)} on {target_col}",
            'dataset_id': dataset_id,
            'target_column': target_col,
            'problem_type': problem_type,
            'algorithm': algo_key,
            'algorithm_name': ALGORITHM_DISPLAY_NAMES.get(algo_key, algo_key.replace('_', ' ').title()),
            'metrics': eval_results.get('metrics', {}),
            'feature_names': feature_names,
            'feature_info': model_artifact['feature_info'],
            'created_at': model_artifact['created_at'],
            'training_time_ms': training_duration_ms,
            'test_size': test_size,
            'train_size': eval_results.get('train_size', 0),
            'test_sample_count': eval_results.get('test_size', 0)
        }
        with open(meta_path, 'w') as f:
            json.dump(sanitize_json(meta_to_save), f, indent=2)

        return sanitize_json({
            'model_id': model_id,
            'metadata': meta_to_save,
            'evaluation': eval_results,
            'preprocessing_summary': prep_summary
        })

    @staticmethod
    def list_models():
        meta_files = glob.glob(os.path.join(MODELS_DIR, '*.json'))
        models_list = []
        for mf in meta_files:
            try:
                with open(mf, 'r') as f:
                    data = json.load(f)
                    models_list.append(data)
            except Exception:
                pass
        models_list = sorted(models_list, key=lambda x: x.get('created_at', ''), reverse=True)
        return models_list

    @staticmethod
    def get_model(model_id):
        meta_path = os.path.join(MODELS_DIR, f"{model_id}.json")
        joblib_path = os.path.join(MODELS_DIR, f"{model_id}.joblib")
        if not os.path.exists(joblib_path):
            raise FileNotFoundError(f"Model {model_id} not found.")

        artifact = joblib.load(joblib_path)
        return sanitize_json({
            'model_id': model_id,
            'dataset_id': artifact.get('dataset_id'),
            'target_column': artifact.get('target_column'),
            'problem_type': artifact.get('problem_type'),
            'algorithm': artifact.get('algorithm'),
            'algorithm_name': artifact.get('algorithm_name'),
            'feature_names': artifact.get('feature_names'),
            'feature_info': artifact.get('feature_info', []),
            'evaluation': artifact.get('eval_results'),
            'created_at': artifact.get('created_at'),
            'training_time_ms': artifact.get('training_time_ms')
        })

    @staticmethod
    def predict(model_id, input_features):
        """
        input_features: dict like { 'sepal_length': 5.1, 'sepal_width': 3.5, ... }
        """
        joblib_path = os.path.join(MODELS_DIR, f"{model_id}.joblib")
        if not os.path.exists(joblib_path):
            raise FileNotFoundError(f"Model {model_id} not found.")

        artifact = joblib.load(joblib_path)
        model = artifact['model']
        feature_names = artifact['feature_names']
        problem_type = artifact['problem_type']

        # Construct single-row DataFrame
        row_data = {}
        missing_features = []
        for feat in feature_names:
            if feat in input_features and input_features[feat] is not None and str(input_features[feat]).strip() != '':
                val = input_features[feat]
                try:
                    row_data[feat] = float(val)
                except ValueError:
                    row_data[feat] = val
            else:
                # Fallback to feature mean or default
                matching_info = next((fi for fi in artifact.get('feature_info', []) if fi['name'] == feat), None)
                if matching_info and matching_info.get('mean') is not None:
                    row_data[feat] = matching_info['mean']
                else:
                    row_data[feat] = 0.0
                missing_features.append(feat)

        df_input = pd.DataFrame([row_data], columns=feature_names)

        # Make prediction
        pred = model.predict(df_input)[0]

        # Classification probabilities if available
        probabilities = None
        confidence = None
        if problem_type == 'classification' and hasattr(model, 'predict_proba'):
            try:
                probs = model.predict_proba(df_input)[0]
                classes = model.classes_
                probabilities = {str(cls): round(float(prob) * 100, 2) for cls, prob in zip(classes, probs)}
                confidence = max(probabilities.values())
            except Exception:
                probabilities = None

        return sanitize_json({
            'model_id': model_id,
            'prediction': str(pred) if problem_type == 'classification' else round(float(pred), 4),
            'problem_type': problem_type,
            'confidence': confidence,
            'probabilities': probabilities,
            'inputs_used': row_data,
            'defaulted_features': missing_features
        })

    @staticmethod
    def get_download_path(model_id):
        joblib_path = os.path.join(MODELS_DIR, f"{model_id}.joblib")
        if not os.path.exists(joblib_path):
            return None
        return joblib_path
