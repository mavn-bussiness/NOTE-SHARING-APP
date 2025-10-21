from flask import Blueprint, request, jsonify
from models import db, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({'message': 'All fields are required'}), 400

        # Check if user exists
        if User.query.filter((User.username == username) | (User.email == email)).first():
            return jsonify({'message': 'User already exists'}), 400

        # Hash password
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        new_user = User(username=username, email=email, password=hashed_pw.decode('utf-8'))
        
        db.session.add(new_user)
        db.session.commit()
        
        print(f"User created successfully: {username} (ID: {new_user.id})")
        
        return jsonify({'message': 'User created successfully'}), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {str(e)}")
        return jsonify({'message': 'Error creating user', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'message': 'Username and password are required'}), 400

        # Find user
        user = User.query.filter_by(username=username).first()
        
        if not user:
            print(f"Login failed: User '{username}' not found")
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            print(f"Login failed: Invalid password for user '{username}'")
            return jsonify({'message': 'Invalid credentials'}), 401

        # Create access token with user ID as identity
        access_token = create_access_token(identity=str(user.id))
        
        print(f"Login successful: {username} (ID: {user.id})")
        print(f"Generated token: {access_token[:20]}...")
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    
    except Exception as e:
        print(f"Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Error during login', 'error': str(e)}), 500

@auth_bp.route('/user/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id) if isinstance(user_id, str) else user_id
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email
        }), 200
        
    except Exception as e:
        print(f"Error fetching user: {str(e)}")
        return jsonify({'message': 'Error fetching user', 'error': str(e)}), 500