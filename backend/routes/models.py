from flask import Blueprint, request, jsonify, send_file
from services.model_service import ModelService
from models.ml_engine import MLEngine

models_bp = Blueprint('models', __name__)

@models_bp.route('/algorithms', methods=['GET'])
def get_algorithms():
    return jsonify({
        'success': True,
        'algorithms': MLEngine.get_supported_algorithms()
    })

@models_bp.route('/models', methods=['GET'])
def list_models():
    try:
        models = ModelService.list_models()
        return jsonify({'success': True, 'models': models})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@models_bp.route('/train', methods=['POST'])
def train_model():
    payload = request.get_json() or {}
    try:
        result = ModelService.train_model(payload)
        return jsonify({
            'success': True,
            'message': 'Model trained successfully.',
            'result': result
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@models_bp.route('/model/<model_id>', methods=['GET'])
def get_model(model_id):
    try:
        details = ModelService.get_model(model_id)
        return jsonify({'success': True, 'model': details})
    except FileNotFoundError:
        return jsonify({'success': False, 'error': f"Model '{model_id}' not found."}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@models_bp.route('/predict', methods=['POST'])
def predict():
    payload = request.get_json() or {}
    model_id = payload.get('model_id')
    inputs = payload.get('inputs', {})

    if not model_id:
        return jsonify({'success': False, 'error': 'model_id is required'}), 400

    try:
        pred_res = ModelService.predict(model_id, inputs)
        return jsonify({
            'success': True,
            'prediction': pred_res
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@models_bp.route('/model/<model_id>/download', methods=['GET'])
def download_model(model_id):
    path = ModelService.get_download_path(model_id)
    if not path:
        return jsonify({'success': False, 'error': 'Model file not found'}), 404
    return send_file(path, as_attachment=True, download_name=f"{model_id}.joblib")
