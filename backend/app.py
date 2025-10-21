from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.auth import auth_bp
from routes.notes import notes_bp

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# JWT Error Handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'message': 'Token has expired',
        'error': 'token_expired'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"Invalid token error: {error}")
    return jsonify({
        'message': 'Signature verification failed',
        'error': 'invalid_token',
        'details': str(error)
    }), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"Missing token error: {error}")
    return jsonify({
        'message': 'Request does not contain an access token',
        'error': 'authorization_required',
        'details': str(error)
    }), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'message': 'Token has been revoked',
        'error': 'token_revoked'
    }), 401

# Add request logging for debugging
@app.before_request
def log_request():
    from flask import request
    print(f"\n--- Incoming Request ---")
    print(f"Method: {request.method}")
    print(f"Path: {request.path}")
    print(f"Headers: {dict(request.headers)}")
    if request.get_json(silent=True):
        print(f"Body: {request.get_json()}")
    print("--- End Request ---\n")

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(notes_bp, url_prefix='/api')

# Test route
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'API is running'}), 200

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)