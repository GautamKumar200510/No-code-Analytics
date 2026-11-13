import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from routes.datasets import datasets_bp
from routes.models import models_bp
from routes.workflow import workflow_bp

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend', 'dist'))

if os.path.exists(FRONTEND_DIST):
    app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
else:
    app = Flask(__name__)

# Enable CORS for all domains and routes
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register API blueprints
app.register_blueprint(datasets_bp, url_prefix='/api')
app.register_blueprint(models_bp, url_prefix='/api')
app.register_blueprint(workflow_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'ML Flow Backend API',
        'version': '1.0.0'
    })

# Serve Frontend SPA
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path.startswith('api'):
        return jsonify({'error': 'Not found'}), 404
    if os.path.exists(FRONTEND_DIST):
        target_path = os.path.join(FRONTEND_DIST, path)
        if path != "" and os.path.exists(target_path):
            return send_from_directory(FRONTEND_DIST, path)
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return jsonify({
        'message': 'ML Flow API is running. Build frontend dist to serve GUI here or run Vite dev server on port 3000.'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"ML Flow running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
