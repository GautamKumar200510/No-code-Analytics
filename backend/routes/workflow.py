from flask import Blueprint, request, jsonify
from services.workflow_service import WorkflowService

workflow_bp = Blueprint('workflow', __name__)

@workflow_bp.route('/workflow/validate', methods=['POST'])
def validate_workflow():
    payload = request.get_json() or {}
    nodes = payload.get('nodes', [])
    edges = payload.get('edges', [])
    res = WorkflowService.validate_workflow(nodes, edges)
    return jsonify(res)

@workflow_bp.route('/workflow/run', methods=['POST'])
def run_workflow():
    payload = request.get_json() or {}
    nodes = payload.get('nodes', [])
    edges = payload.get('edges', [])
    if not nodes:
        return jsonify({'success': False, 'error': 'No nodes provided in workflow'}), 400

    try:
        result = WorkflowService.execute_workflow(payload)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
