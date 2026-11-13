from flask import Blueprint, request, jsonify
from services.data_service import DataService

datasets_bp = Blueprint('datasets', __name__)

@datasets_bp.route('/datasets', methods=['GET'])
def list_datasets():
    try:
        datasets = DataService.list_datasets()
        return jsonify({'success': True, 'datasets': datasets})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@datasets_bp.route('/upload', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if not file.filename:
        return jsonify({'success': False, 'error': 'Filename is empty'}), 400

    if not file.filename.lower().endswith('.csv'):
        return jsonify({'success': False, 'error': 'Only CSV files are allowed'}), 400

    try:
        res = DataService.save_uploaded_file(file, file.filename)
        # Immediately return dataset inspection
        df = DataService.load_dataset(res['id'])
        details = DataService.inspect_dataset(df, dataset_id=res['id'], name=res['name'])
        return jsonify({
            'success': True,
            'message': f"Dataset '{file.filename}' uploaded successfully.",
            'dataset': res,
            'details': details
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@datasets_bp.route('/dataset/<dataset_id>', methods=['GET'])
def get_dataset(dataset_id):
    try:
        df = DataService.load_dataset(dataset_id)
        name = dataset_id.replace('sample_', '').replace('_', ' ').title()
        details = DataService.inspect_dataset(df, dataset_id=dataset_id, name=name)
        return jsonify({'success': True, 'details': details})
    except FileNotFoundError:
        return jsonify({'success': False, 'error': f"Dataset '{dataset_id}' not found."}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@datasets_bp.route('/preprocess', methods=['POST'])
def preprocess():
    payload = request.get_json() or {}
    dataset_id = payload.get('dataset_id')
    if not dataset_id:
        return jsonify({'success': False, 'error': 'dataset_id is required'}), 400

    try:
        df = DataService.load_dataset(dataset_id)
        df_processed, summary, artifacts = DataService.preprocess_data(df, payload.get('config', {}))
        return jsonify({
            'success': True,
            'summary': summary,
            'preview': summary['preview']
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
