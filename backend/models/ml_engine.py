import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.svm import SVC, SVR
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
    mean_absolute_error, mean_squared_error, r2_score
)
from utils.helpers import sanitize_json

ALGORITHM_MAP = {
    'classification': {
        'logistic_regression': LogisticRegression,
        'decision_tree': DecisionTreeClassifier,
        'random_forest': RandomForestClassifier,
        'knn': KNeighborsClassifier,
        'svm': SVC
    },
    'regression': {
        'linear_regression': LinearRegression,
        'decision_tree': DecisionTreeRegressor,
        'random_forest': RandomForestRegressor,
        'knn': KNeighborsRegressor,
        'svm': SVR
    }
}

ALGORITHM_DISPLAY_NAMES = {
    'logistic_regression': 'Logistic Regression',
    'linear_regression': 'Linear Regression',
    'decision_tree': 'Decision Tree',
    'random_forest': 'Random Forest',
    'knn': 'K-Nearest Neighbors (KNN)',
    'svm': 'Support Vector Machine (SVM)'
}

class MLEngine:
    @staticmethod
    def get_supported_algorithms():
        return {
            'classification': [
                {'id': 'logistic_regression', 'name': 'Logistic Regression', 'desc': 'Best for binary/multinomial linear decision boundaries'},
                {'id': 'decision_tree', 'name': 'Decision Tree Classifier', 'desc': 'Interpretable tree-based rule learner'},
                {'id': 'random_forest', 'name': 'Random Forest Classifier', 'desc': 'Ensemble of decision trees for higher accuracy and robustness'},
                {'id': 'knn', 'name': 'K-Nearest Neighbors (KNN)', 'desc': 'Instance-based classification using proximity distance'},
                {'id': 'svm', 'name': 'Support Vector Machine (SVM)', 'desc': 'Maximizes margin separation in high-dimensional space'}
            ],
            'regression': [
                {'id': 'linear_regression', 'name': 'Linear Regression', 'desc': 'Models linear relationships between features and continuous target'},
                {'id': 'decision_tree', 'name': 'Decision Tree Regressor', 'desc': 'Piecewise constant approximations using decision trees'},
                {'id': 'random_forest', 'name': 'Random Forest Regressor', 'desc': 'Averaged ensemble of regression trees to minimize variance'},
                {'id': 'knn', 'name': 'K-Nearest Neighbors Regressor', 'desc': 'Predicts target as average of k nearest neighbor samples'},
                {'id': 'svm', 'name': 'Support Vector Regressor (SVR)', 'desc': 'Fits error within margin threshold epsilon'}
            ]
        }

    @staticmethod
    def build_model(problem_type, algorithm_key, hyperparams=None):
        if hyperparams is None:
            hyperparams = {}

        algo_key = algorithm_key.lower().replace('-', '_').replace(' ', '_')
        if problem_type not in ALGORITHM_MAP:
            raise ValueError(f"Unknown problem type '{problem_type}'. Supported: 'classification', 'regression'.")
        
        algo_dict = ALGORITHM_MAP[problem_type]
        if algo_key not in algo_dict:
            raise ValueError(f"Unknown algorithm '{algorithm_key}' for {problem_type}. Supported: {list(algo_dict.keys())}")

        cls = algo_dict[algo_key]

        if problem_type == 'classification':
            if algo_key == 'logistic_regression':
                max_iter = int(hyperparams.get('max_iter', 1000))
                C = float(hyperparams.get('C', 1.0))
                return cls(max_iter=max_iter, C=C, random_state=42)
            elif algo_key == 'decision_tree':
                max_depth = int(hyperparams['max_depth']) if hyperparams.get('max_depth') else None
                min_samples_split = int(hyperparams.get('min_samples_split', 2))
                return cls(max_depth=max_depth, min_samples_split=min_samples_split, random_state=42)
            elif algo_key == 'random_forest':
                n_estimators = int(hyperparams.get('n_estimators', 100))
                max_depth = int(hyperparams['max_depth']) if hyperparams.get('max_depth') else None
                return cls(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
            elif algo_key == 'knn':
                n_neighbors = int(hyperparams.get('n_neighbors', 5))
                return cls(n_neighbors=n_neighbors)
            elif algo_key == 'svm':
                kernel = hyperparams.get('kernel', 'rbf')
                C = float(hyperparams.get('C', 1.0))
                return cls(kernel=kernel, C=C, probability=True, random_state=42)

        else:  # regression
            if algo_key == 'linear_regression':
                return cls()
            elif algo_key == 'decision_tree':
                max_depth = int(hyperparams['max_depth']) if hyperparams.get('max_depth') else None
                min_samples_split = int(hyperparams.get('min_samples_split', 2))
                return cls(max_depth=max_depth, min_samples_split=min_samples_split, random_state=42)
            elif algo_key == 'random_forest':
                n_estimators = int(hyperparams.get('n_estimators', 100))
                max_depth = int(hyperparams['max_depth']) if hyperparams.get('max_depth') else None
                return cls(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
            elif algo_key == 'knn':
                n_neighbors = int(hyperparams.get('n_neighbors', 5))
                return cls(n_neighbors=n_neighbors)
            elif algo_key == 'svm':
                kernel = hyperparams.get('kernel', 'rbf')
                C = float(hyperparams.get('C', 1.0))
                return cls(kernel=kernel, C=C)

        return cls()

    @staticmethod
    def train_and_evaluate(model, X_train, X_test, y_train, y_test, problem_type, feature_names=None):
        # 1. Fit model
        model.fit(X_train, y_train)

        # 2. Predictions
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)

        feature_importances = []
        if feature_names:
            if hasattr(model, 'feature_importances_'):
                importances = model.feature_importances_
                for name, imp in zip(feature_names, importances):
                    feature_importances.append({'feature': name, 'importance': round(float(imp), 4)})
                feature_importances = sorted(feature_importances, key=lambda x: x['importance'], reverse=True)
            elif hasattr(model, 'coef_'):
                coef = model.coef_
                # If 2D (multiclass or multioutput), average absolute values
                if len(coef.shape) > 1:
                    avg_coef = np.mean(np.abs(coef), axis=0)
                else:
                    avg_coef = np.abs(coef)
                for name, val in zip(feature_names, avg_coef):
                    feature_importances.append({'feature': name, 'importance': round(float(val), 4)})
                feature_importances = sorted(feature_importances, key=lambda x: x['importance'], reverse=True)

        if problem_type == 'classification':
            train_acc = round(accuracy_score(y_train, y_train_pred) * 100, 2)
            test_acc = round(accuracy_score(y_test, y_test_pred) * 100, 2)
            precision = round(precision_score(y_test, y_test_pred, average='weighted', zero_division=0) * 100, 2)
            recall = round(recall_score(y_test, y_test_pred, average='weighted', zero_division=0) * 100, 2)
            f1 = round(f1_score(y_test, y_test_pred, average='weighted', zero_division=0) * 100, 2)

            # Confusion Matrix
            labels = np.unique(np.concatenate([y_train, y_test]))
            labels_str = [str(l) for l in labels]
            cm = confusion_matrix(y_test, y_test_pred, labels=labels)

            cm_data = {
                'labels': labels_str,
                'matrix': cm.tolist(),
                'breakdown': []
            }
            for i, true_label in enumerate(labels_str):
                for j, pred_label in enumerate(labels_str):
                    cm_data['breakdown'].append({
                        'actual': true_label,
                        'predicted': pred_label,
                        'count': int(cm[i][j])
                    })

            # Class report
            clf_rep = classification_report(y_test, y_test_pred, target_names=labels_str, output_dict=True, zero_division=0)

            return sanitize_json({
                'problem_type': 'classification',
                'metrics': {
                    'accuracy': test_acc,
                    'train_accuracy': train_acc,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1
                },
                'confusion_matrix': cm_data,
                'classification_report': clf_rep,
                'feature_importance': feature_importances,
                'train_size': len(X_train),
                'test_size': len(X_test),
                'classes': labels_str
            })

        else:  # regression
            train_r2 = round(r2_score(y_train, y_train_pred), 4)
            r2 = round(r2_score(y_test, y_test_pred), 4)
            mae = round(mean_absolute_error(y_test, y_test_pred), 4)
            mse = round(mean_squared_error(y_test, y_test_pred), 4)
            rmse = round(float(np.sqrt(mse)), 4)

            # Actual vs Predicted comparison sample (up to 50 items)
            y_test_arr = np.array(y_test)
            sample_count = min(len(y_test_arr), 50)
            sample_indices = np.linspace(0, len(y_test_arr) - 1, sample_count, dtype=int)

            actual_vs_pred = []
            for idx in sample_indices:
                act = float(y_test_arr[idx])
                pred = float(y_test_pred[idx])
                actual_vs_pred.append({
                    'index': int(idx) + 1,
                    'actual': round(act, 3),
                    'predicted': round(pred, 3),
                    'residual': round(act - pred, 3)
                })

            return sanitize_json({
                'problem_type': 'regression',
                'metrics': {
                    'r2_score': r2,
                    'train_r2': train_r2,
                    'mae': mae,
                    'mse': mse,
                    'rmse': rmse
                },
                'actual_vs_predicted': actual_vs_pred,
                'feature_importance': feature_importances,
                'train_size': len(X_train),
                'test_size': len(X_test)
            })
