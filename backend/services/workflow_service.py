import time
import pandas as pd
import numpy as np
from services.data_service import DataService
from services.model_service import ModelService
from models.ml_engine import MLEngine, ALGORITHM_DISPLAY_NAMES
from utils.helpers import sanitize_json, generate_id

class WorkflowService:
    @staticmethod
    def validate_workflow(nodes, edges):
        errors = []
        node_map = {n['id']: n for n in nodes}
        node_types = {n.get('type'): n for n in nodes}

        # 1. Must have Data Loader
        if 'dataLoader' not in node_types:
            errors.append("Workflow must contain a 'Data Loading' node.")
        else:
            dl_node = node_types['dataLoader']
            dataset_id = dl_node.get('data', {}).get('dataset_id')
            if not dataset_id:
                errors.append("Data Loading node must have a dataset selected.")

        # 2. Must have Model Trainer or Model Selector
        if 'modelTrainer' not in node_types and 'modelSelector' not in node_types:
            errors.append("Workflow must include a 'Model Training' or 'Model Selection' node.")

        # 3. Target column check
        target_found = False
        for n in nodes:
            t = n.get('data', {}).get('target_column')
            if t:
                target_found = True
                break
        if not target_found:
            errors.append("A target column must be specified (in Data Loading or Model Training node).")

        # 4. Check connectivity (edges)
        if len(nodes) > 1 and len(edges) == 0:
            errors.append("Nodes must be connected together with edges to form a pipeline.")

        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }

    @staticmethod
    def execute_workflow(workflow_payload):
        """
        Executes a visual pipeline submitted from the frontend React Flow canvas.
        """
        start_total = time.time()
        nodes = workflow_payload.get('nodes', [])
        edges = workflow_payload.get('edges', [])

        validation = WorkflowService.validate_workflow(nodes, edges)
        if not validation['is_valid']:
            return sanitize_json({
                'success': False,
                'errors': validation['errors'],
                'message': 'Workflow validation failed.'
            })

        # Build lookup and topological sequence
        node_by_type = {}
        for n in nodes:
            node_by_type[n.get('type')] = n

        steps_log = []
        current_data = None
        current_df = None
        dataset_id = None
        target_column = None
        problem_type = 'classification'
        algorithm_key = 'logistic_regression'
        hyperparams = {}
        test_size = 0.2
        random_state = 42
        preprocessing_config = {
            'missing_values': {'numerical_strategy': 'mean', 'categorical_strategy': 'mode'},
            'categorical_encoding': 'one_hot',
            'scaling': 'standard',
            'selected_features': None
        }

        # Node 1: Data Loading
        dl_node = node_by_type.get('dataLoader')
        if dl_node:
            t0 = time.time()
            data_cfg = dl_node.get('data', {})
            dataset_id = data_cfg.get('dataset_id')
            target_column = data_cfg.get('target_column') or target_column
            
            try:
                current_df = DataService.load_dataset(dataset_id)
                dur = round((time.time() - t0) * 1000, 2)
                steps_log.append({
                    'node_id': dl_node['id'],
                    'node_type': 'dataLoader',
                    'step_name': 'Data Loading',
                    'status': 'success',
                    'duration_ms': dur,
                    'message': f"Loaded dataset '{dataset_id}' with {len(current_df)} rows and {len(current_df.columns)} columns.",
                    'output': {
                        'rows': len(current_df),
                        'columns': len(current_df.columns),
                        'column_names': list(current_df.columns),
                        'preview': current_df.head(5).to_dict(orient='records')
                    }
                })
            except Exception as e:
                return sanitize_json({
                    'success': False,
                    'node_id': dl_node['id'],
                    'message': f"Data Loading failed: {str(e)}",
                    'steps': steps_log
                })

        # Node: Handle Missing Values (if present)
        mv_node = node_by_type.get('missingValueHandler')
        if mv_node:
            t0 = time.time()
            mv_data = mv_node.get('data', {})
            num_strat = mv_data.get('numerical_strategy', 'mean')
            cat_strat = mv_data.get('categorical_strategy', 'mode')
            preprocessing_config['missing_values']['numerical_strategy'] = num_strat
            preprocessing_config['missing_values']['categorical_strategy'] = cat_strat

            total_null_before = int(current_df.isna().sum().sum())
            dur = round((time.time() - t0) * 1000, 2)
            steps_log.append({
                'node_id': mv_node['id'],
                'node_type': 'missingValueHandler',
                'step_name': 'Handle Missing Values',
                'status': 'success',
                'duration_ms': dur,
                'message': f"Configured numerical strategy: '{num_strat}', categorical strategy: '{cat_strat}'. (Found {total_null_before} missing cells to handle)",
                'output': {
                    'numerical_strategy': num_strat,
                    'categorical_strategy': cat_strat,
                    'missing_cells_identified': total_null_before
                }
            })

        # Node: Data Preprocessing (if present)
        dp_node = node_by_type.get('preprocessor')
        if dp_node:
            t0 = time.time()
            dp_data = dp_node.get('data', {})
            cat_enc = dp_data.get('categorical_encoding', 'one_hot')
            scale_method = dp_data.get('scaling', 'standard')
            preprocessing_config['categorical_encoding'] = cat_enc
            preprocessing_config['scaling'] = scale_method

            dur = round((time.time() - t0) * 1000, 2)
            steps_log.append({
                'node_id': dp_node['id'],
                'node_type': 'preprocessor',
                'step_name': 'Data Preprocessing',
                'status': 'success',
                'duration_ms': dur,
                'message': f"Configured Encoding: '{cat_enc}', Scaling: '{scale_method}'.",
                'output': {
                    'encoding': cat_enc,
                    'scaling': scale_method
                }
            })

        # Node: Feature Selection (if present)
        fs_node = node_by_type.get('featureSelector')
        if fs_node:
            t0 = time.time()
            fs_data = fs_node.get('data', {})
            selected_features = fs_data.get('selected_features')
            if selected_features and len(selected_features) > 0:
                preprocessing_config['selected_features'] = selected_features
            dur = round((time.time() - t0) * 1000, 2)
            steps_log.append({
                'node_id': fs_node['id'],
                'node_type': 'featureSelector',
                'step_name': 'Feature Selection',
                'status': 'success',
                'duration_ms': dur,
                'message': f"Selected {len(selected_features) if selected_features else 'All'} features.",
                'output': {
                    'selected_features': selected_features or list(current_df.columns)
                }
            })

        # Node: Train-Test Split (if present)
        tts_node = node_by_type.get('trainTestSplit')
        if tts_node:
            t0 = time.time()
            tts_data = tts_node.get('data', {})
            test_size = float(tts_data.get('test_size', 0.2))
            random_state = int(tts_data.get('random_state', 42))
            train_pct = int((1 - test_size) * 100)
            test_pct = int(test_size * 100)
            dur = round((time.time() - t0) * 1000, 2)
            steps_log.append({
                'node_id': tts_node['id'],
                'node_type': 'trainTestSplit',
                'step_name': 'Train-Test Split',
                'status': 'success',
                'duration_ms': dur,
                'message': f"Configured split ratio: {train_pct}% Train / {test_pct}% Test (random state={random_state}).",
                'output': {
                    'train_ratio': 1 - test_size,
                    'test_ratio': test_size,
                    'random_state': random_state
                }
            })

        # Node: Model Selection
        ms_node = node_by_type.get('modelSelector')
        if ms_node:
            t0 = time.time()
            ms_data = ms_node.get('data', {})
            problem_type = ms_data.get('problem_type', problem_type).lower()
            algorithm_key = ms_data.get('algorithm', algorithm_key).lower()
            if ms_data.get('target_column'):
                target_column = ms_data.get('target_column')
            hyperparams = ms_data.get('hyperparams', hyperparams)
            dur = round((time.time() - t0) * 1000, 2)
            steps_log.append({
                'node_id': ms_node['id'],
                'node_type': 'modelSelector',
                'step_name': 'Model Selection',
                'status': 'success',
                'duration_ms': dur,
                'message': f"Selected Algorithm: {ALGORITHM_DISPLAY_NAMES.get(algorithm_key, algorithm_key)} for {problem_type.title()}.",
                'output': {
                    'problem_type': problem_type,
                    'algorithm': algorithm_key,
                    'algorithm_name': ALGORITHM_DISPLAY_NAMES.get(algorithm_key, algorithm_key),
                    'hyperparams': hyperparams
                }
            })

        # Node: Model Training
        mt_node = node_by_type.get('modelTrainer')
        if mt_node:
            mt_data = mt_node.get('data', {})
            if mt_data.get('target_column'):
                target_column = mt_data.get('target_column')
            if mt_data.get('problem_type'):
                problem_type = mt_data.get('problem_type').lower()
            if mt_data.get('algorithm'):
                algorithm_key = mt_data.get('algorithm').lower()

        # Target fallback if not set yet: pick last column
        if not target_column and current_df is not None:
            target_column = current_df.columns[-1]

        # AUTO-DETECT problem type if target is continuous float
        if target_column in current_df.columns:
            target_series = current_df[target_column]
            if pd.api.types.is_float_dtype(target_series) and target_series.nunique() > 20:
                # Continuous target - default to regression if algorithm was default logistic_regression
                if algorithm_key == 'logistic_regression':
                    problem_type = 'regression'
                    algorithm_key = 'linear_regression'

        # Now execute actual Training via ModelService!
        training_config = {
            'dataset_id': dataset_id,
            'target_column': target_column,
            'problem_type': problem_type,
            'algorithm': algorithm_key,
            'test_size': test_size,
            'random_state': random_state,
            'hyperparams': hyperparams,
            'preprocessing': preprocessing_config
        }

        try:
            train_start = time.time()
            train_result = ModelService.train_model(training_config)
            train_duration = round((time.time() - train_start) * 1000, 2)

            # Record Model Training step
            active_train_node_id = (mt_node['id'] if mt_node else (ms_node['id'] if ms_node else 'train_step'))
            steps_log.append({
                'node_id': active_train_node_id,
                'node_type': 'modelTrainer',
                'step_name': 'Model Training',
                'status': 'success',
                'duration_ms': train_duration,
                'message': f"Successfully trained {ALGORITHM_DISPLAY_NAMES.get(algorithm_key, algorithm_key)} on {target_column} in {train_duration} ms.",
                'output': {
                    'model_id': train_result['model_id'],
                    'train_samples': train_result['evaluation'].get('train_size'),
                    'test_samples': train_result['evaluation'].get('test_size'),
                    'features_count': len(train_result['metadata'].get('feature_names', []))
                }
            })

            # Node: Model Evaluation
            me_node = node_by_type.get('modelEvaluator')
            eval_node_id = me_node['id'] if me_node else 'eval_step'
            eval_metrics = train_result['evaluation'].get('metrics', {})
            primary_metric_str = f"Accuracy: {eval_metrics.get('accuracy')}%" if problem_type == 'classification' else f"R² Score: {eval_metrics.get('r2_score')}"
            
            steps_log.append({
                'node_id': eval_node_id,
                'node_type': 'modelEvaluator',
                'step_name': 'Model Evaluation',
                'status': 'success',
                'duration_ms': 5,
                'message': f"Model evaluation complete. {primary_metric_str}.",
                'output': train_result['evaluation']
            })

            # Node: Prediction (if present)
            pred_node = node_by_type.get('predictor')
            test_prediction = None
            if pred_node:
                t0 = time.time()
                # Run sample prediction using the first test sample features
                first_feat_inputs = {}
                for fi in train_result['metadata'].get('feature_info', []):
                    first_feat_inputs[fi['name']] = fi.get('sample') or fi.get('mean') or 0.0

                test_prediction = ModelService.predict(train_result['model_id'], first_feat_inputs)
                dur = round((time.time() - t0) * 1000, 2)
                steps_log.append({
                    'node_id': pred_node['id'],
                    'node_type': 'predictor',
                    'step_name': 'Prediction Block',
                    'status': 'success',
                    'duration_ms': dur,
                    'message': f"Prediction pipeline ready. Sample prediction generated: {test_prediction.get('prediction')}.",
                    'output': test_prediction
                })

            total_duration = round((time.time() - start_total) * 1000, 2)
            return sanitize_json({
                'success': True,
                'workflow_id': generate_id("wf"),
                'model_id': train_result['model_id'],
                'model_metadata': train_result['metadata'],
                'evaluation': train_result['evaluation'],
                'preprocessing_summary': train_result.get('preprocessing_summary'),
                'sample_prediction': test_prediction,
                'steps': steps_log,
                'execution_time_ms': total_duration
            })

        except Exception as e:
            return sanitize_json({
                'success': False,
                'error': str(e),
                'message': f"Workflow execution halted: {str(e)}",
                'steps': steps_log
            })
