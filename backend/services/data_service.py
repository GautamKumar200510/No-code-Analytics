import os
import glob
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from utils.helpers import sanitize_json, generate_id

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
SAMPLE_DIR = os.path.join(BASE_DIR, 'sample_data')

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(SAMPLE_DIR, exist_ok=True)

class DataService:
    @staticmethod
    def list_datasets():
        datasets = []
        
        # Sample datasets
        sample_files = glob.glob(os.path.join(SAMPLE_DIR, '*.csv'))
        for f in sample_files:
            fname = os.path.basename(f)
            name = os.path.splitext(fname)[0].replace('_', ' ').title()
            size_kb = round(os.path.getsize(f) / 1024, 2)
            try:
                df = pd.read_csv(f)
                datasets.append({
                    'id': f"sample_{os.path.splitext(fname)[0]}",
                    'name': f"{name} (Sample)",
                    'filename': fname,
                    'is_sample': True,
                    'rows': len(df),
                    'columns': len(df.columns),
                    'size_kb': size_kb,
                    'column_names': list(df.columns)
                })
            except Exception:
                pass

        # Uploaded datasets
        upload_files = glob.glob(os.path.join(UPLOAD_DIR, '*.csv'))
        for f in upload_files:
            fname = os.path.basename(f)
            size_kb = round(os.path.getsize(f) / 1024, 2)
            try:
                df = pd.read_csv(f)
                datasets.append({
                    'id': fname.replace('.csv', ''),
                    'name': fname,
                    'filename': fname,
                    'is_sample': False,
                    'rows': len(df),
                    'columns': len(df.columns),
                    'size_kb': size_kb,
                    'column_names': list(df.columns)
                })
            except Exception:
                pass

        return datasets

    @staticmethod
    def get_dataset_path(dataset_id):
        if dataset_id.startswith('sample_'):
            fname = dataset_id.replace('sample_', '') + '.csv'
            path = os.path.join(SAMPLE_DIR, fname)
            if os.path.exists(path):
                return path
        
        # Check upload dir
        path = os.path.join(UPLOAD_DIR, f"{dataset_id}.csv")
        if os.path.exists(path):
            return path
            
        # Also check direct filename
        path = os.path.join(UPLOAD_DIR, dataset_id)
        if os.path.exists(path):
            return path

        # Check sample dir directly
        path = os.path.join(SAMPLE_DIR, f"{dataset_id}.csv")
        if os.path.exists(path):
            return path

        return None

    @staticmethod
    def load_dataset(dataset_id):
        path = DataService.get_dataset_path(dataset_id)
        if not path or not os.path.exists(path):
            raise FileNotFoundError(f"Dataset {dataset_id} not found.")
        return pd.read_csv(path)

    @staticmethod
    def save_uploaded_file(file, original_filename):
        safe_name = os.path.splitext(original_filename)[0]
        safe_name = "".join(c for c in safe_name if c.isalnum() or c in ('_', '-')).strip()
        uid = generate_id("ds")
        target_filename = f"{safe_name}_{uid}.csv"
        target_path = os.path.join(UPLOAD_DIR, target_filename)
        file.save(target_path)
        
        # Validate that it is a valid CSV
        try:
            df = pd.read_csv(target_path)
            return {
                'id': target_filename.replace('.csv', ''),
                'name': original_filename,
                'filename': target_filename,
                'rows': len(df),
                'columns': len(df.columns),
                'column_names': list(df.columns),
                'size_kb': round(os.path.getsize(target_path) / 1024, 2)
            }
        except Exception as e:
            if os.path.exists(target_path):
                os.remove(target_path)
            raise ValueError(f"Uploaded file is not a valid CSV: {str(e)}")

    @staticmethod
    def inspect_dataset(df, dataset_id=None, name="Dataset"):
        total_rows = len(df)
        total_cols = len(df.columns)
        
        columns_info = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            is_num = pd.api.types.is_numeric_dtype(df[col])
            null_count = int(df[col].isna().sum())
            null_pct = round((null_count / total_rows) * 100, 2) if total_rows > 0 else 0
            unique_count = int(df[col].nunique())
            
            # Sample distinct values
            samples = df[col].dropna().unique()[:5].tolist()
            sample_vals = [str(s) for s in samples]

            columns_info.append({
                'name': col,
                'type': 'numerical' if is_num else 'categorical',
                'raw_dtype': dtype,
                'null_count': null_count,
                'null_percentage': null_pct,
                'unique_count': unique_count,
                'sample_values': sample_vals
            })

        # Numerical statistics
        num_cols = df.select_dtypes(include=[np.number]).columns
        num_stats = {}
        if len(num_cols) > 0:
            desc = df[num_cols].describe().to_dict()
            for col in num_cols:
                num_stats[col] = {
                    'count': int(desc[col].get('count', 0)),
                    'mean': round(desc[col].get('mean', 0), 3) if not pd.isna(desc[col].get('mean')) else 0,
                    'std': round(desc[col].get('std', 0), 3) if not pd.isna(desc[col].get('std')) else 0,
                    'min': round(desc[col].get('min', 0), 3) if not pd.isna(desc[col].get('min')) else 0,
                    'q25': round(desc[col].get('25%', 0), 3) if not pd.isna(desc[col].get('25%')) else 0,
                    'median': round(desc[col].get('50%', 0), 3) if not pd.isna(desc[col].get('50%')) else 0,
                    'q75': round(desc[col].get('75%', 0), 3) if not pd.isna(desc[col].get('75%')) else 0,
                    'max': round(desc[col].get('max', 0), 3) if not pd.isna(desc[col].get('max')) else 0
                }

        # Categorical statistics
        cat_cols = df.select_dtypes(exclude=[np.number]).columns
        cat_stats = {}
        for col in cat_cols:
            val_counts = df[col].value_counts().head(5).to_dict()
            cat_stats[col] = {
                'unique_count': int(df[col].nunique()),
                'top': str(df[col].mode().iloc[0]) if not df[col].mode().empty else None,
                'top_frequency': int(df[col].value_counts().iloc[0]) if not df[col].empty and not df[col].value_counts().empty else 0,
                'top_values': {str(k): int(v) for k, v in val_counts.items()}
            }

        # Preview rows (first 20)
        preview_df = df.head(20).copy()
        # Convert NaN to None for JSON
        preview_records = preview_df.replace({np.nan: None}).to_dict(orient='records')

        # Total missing summary
        total_missing = int(df.isna().sum().sum())
        cols_with_missing = [c for c in columns_info if c['null_count'] > 0]

        # Correlation matrix for numerical columns (max 10 columns for chart readability)
        correlation_matrix = []
        if len(num_cols) >= 2:
            sub_num = num_cols[:10]
            corr_df = df[sub_num].corr().round(3).fillna(0)
            for c1 in sub_num:
                row = {'feature': c1}
                for c2 in sub_num:
                    row[c2] = float(corr_df.loc[c1, c2])
                correlation_matrix.append(row)

        return sanitize_json({
            'dataset_id': dataset_id,
            'name': name,
            'rows': total_rows,
            'columns': total_cols,
            'columns_info': columns_info,
            'numerical_stats': num_stats,
            'categorical_stats': cat_stats,
            'total_missing': total_missing,
            'missing_columns': cols_with_missing,
            'preview': preview_records,
            'correlation_matrix': correlation_matrix
        })

    @staticmethod
    def preprocess_data(df, config=None):
        """
        Preprocesses DataFrame based on configuration:
        config = {
            'target_column': str,
            'missing_values': {
                'numerical_strategy': 'mean' | 'median' | 'drop_row' | 'zero',
                'categorical_strategy': 'mode' | 'drop_row' | 'unknown'
            },
            'categorical_encoding': 'one_hot' | 'label' | 'none',
            'scaling': 'standard' | 'minmax' | 'none',
            'selected_features': list of str (optional)
        }
        """
        if config is None:
            config = {}

        df_processed = df.copy()
        initial_rows, initial_cols = df_processed.shape
        log_steps = []

        target_col = config.get('target_column')
        if target_col and target_col not in df_processed.columns:
            target_col = None

        # 1. Feature Selection (filter columns before or keep target)
        selected_features = config.get('selected_features')
        if selected_features and isinstance(selected_features, list) and len(selected_features) > 0:
            keep_cols = [c for c in selected_features if c in df_processed.columns]
            if target_col and target_col not in keep_cols and target_col in df_processed.columns:
                keep_cols.append(target_col)
            if len(keep_cols) > 0:
                dropped_cols = [c for c in df_processed.columns if c not in keep_cols]
                df_processed = df_processed[keep_cols]
                log_steps.append(f"Feature Selection: Kept {len(keep_cols)} columns. Dropped {len(dropped_cols)} columns.")

        # 2. Missing Value Handling
        missing_cfg = config.get('missing_values', {})
        num_strat = missing_cfg.get('numerical_strategy', 'mean')
        cat_strat = missing_cfg.get('categorical_strategy', 'mode')

        # Drop rows if strategy specifies drop_row
        if num_strat == 'drop_row' or cat_strat == 'drop_row':
            before_len = len(df_processed)
            df_processed.dropna(inplace=True)
            dropped_rows = before_len - len(df_processed)
            log_steps.append(f"Missing Values: Dropped {dropped_rows} rows with missing values.")
        else:
            # Impute numerical columns
            num_cols = df_processed.select_dtypes(include=[np.number]).columns
            for col in num_cols:
                if col == target_col:
                    continue
                if df_processed[col].isna().sum() > 0:
                    if num_strat == 'median':
                        val = df_processed[col].median()
                        df_processed[col] = df_processed[col].fillna(val)
                        log_steps.append(f"Missing Values: Filled missing in '{col}' with median ({round(val, 2)}).")
                    elif num_strat == 'zero':
                        df_processed[col] = df_processed[col].fillna(0)
                        log_steps.append(f"Missing Values: Filled missing in '{col}' with 0.")
                    else:  # mean default
                        val = df_processed[col].mean()
                        df_processed[col] = df_processed[col].fillna(val)
                        log_steps.append(f"Missing Values: Filled missing in '{col}' with mean ({round(val, 2)}).")

            # Impute categorical columns
            cat_cols = df_processed.select_dtypes(exclude=[np.number]).columns
            for col in cat_cols:
                if col == target_col:
                    continue
                if df_processed[col].isna().sum() > 0:
                    if cat_strat == 'unknown':
                        df_processed[col] = df_processed[col].fillna('Unknown')
                        log_steps.append(f"Missing Values: Filled missing in '{col}' with 'Unknown'.")
                    else:  # mode
                        mode_vals = df_processed[col].mode()
                        mode_val = mode_vals.iloc[0] if not mode_vals.empty else 'Missing'
                        df_processed[col] = df_processed[col].fillna(mode_val)
                        log_steps.append(f"Missing Values: Filled missing in '{col}' with mode ('{mode_val}').")

        # If target has missing, drop those rows specifically
        if target_col and target_col in df_processed.columns:
            if df_processed[target_col].isna().sum() > 0:
                t_dropped = int(df_processed[target_col].isna().sum())
                df_processed.dropna(subset=[target_col], inplace=True)
                log_steps.append(f"Target Column: Dropped {t_dropped} rows where target '{target_col}' was missing.")

        # 3. Categorical Encoding
        encoding_strat = config.get('categorical_encoding', 'one_hot')
        label_encoders = {}
        
        feature_cat_cols = [c for c in df_processed.select_dtypes(exclude=[np.number]).columns if c != target_col]
        
        if len(feature_cat_cols) > 0:
            if encoding_strat == 'label':
                for col in feature_cat_cols:
                    le = LabelEncoder()
                    df_processed[col] = le.fit_transform(df_processed[col].astype(str))
                    label_encoders[col] = {str(cls): int(idx) for idx, cls in enumerate(le.classes_)}
                log_steps.append(f"Encoding: Label encoded features: {', '.join(feature_cat_cols)}.")
            elif encoding_strat == 'one_hot':
                initial_feature_count = len(df_processed.columns)
                target_series = df_processed[target_col] if target_col else None
                features_df = df_processed.drop(columns=[target_col]) if target_col else df_processed
                
                features_encoded = pd.get_dummies(features_df, columns=feature_cat_cols, drop_first=False, dtype=float)
                if target_series is not None:
                    features_encoded[target_col] = target_series.values
                df_processed = features_encoded
                log_steps.append(f"Encoding: One-hot encoded {len(feature_cat_cols)} categorical columns (created {len(df_processed.columns) - initial_feature_count} new binary columns).")

        # 4. Feature Scaling
        scaling_strat = config.get('scaling', 'standard')
        scaler_artifact = None
        scaled_feature_names = []
        
        feature_num_cols = [c for c in df_processed.select_dtypes(include=[np.number]).columns if c != target_col]
        
        if scaling_strat in ('standard', 'minmax') and len(feature_num_cols) > 0:
            scaler = StandardScaler() if scaling_strat == 'standard' else MinMaxScaler()
            scaled_vals = scaler.fit_transform(df_processed[feature_num_cols])
            df_processed[feature_num_cols] = scaled_vals
            scaled_feature_names = list(feature_num_cols)
            scaler_artifact = {
                'type': scaling_strat,
                'mean_or_min': scaler.mean_.tolist() if hasattr(scaler, 'mean_') else scaler.min_.tolist(),
                'scale': scaler.scale_.tolist()
            }
            log_steps.append(f"Scaling: Applied {scaling_strat.title()}Scaler to {len(feature_num_cols)} numerical features.")

        final_rows, final_cols = df_processed.shape
        preview_records = df_processed.head(20).replace({np.nan: None}).to_dict(orient='records')

        summary = {
            'initial_shape': [initial_rows, initial_cols],
            'final_shape': [final_rows, final_cols],
            'remaining_rows': final_rows,
            'remaining_columns': final_cols,
            'log_steps': log_steps,
            'column_names': list(df_processed.columns),
            'target_column': target_col,
            'preview': preview_records
        }

        artifacts = {
            'label_encoders': label_encoders,
            'scaler': scaler_artifact,
            'scaled_features': scaled_feature_names,
            'feature_names': [c for c in df_processed.columns if c != target_col]
        }

        return df_processed, summary, artifacts
