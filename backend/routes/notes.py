from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Note
from datetime import datetime
import json

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/notes', methods=['GET'])
@jwt_required()
def get_notes():
    try:
        user_id = get_jwt_identity()
        print(f"Fetching notes for user_id: {user_id}")
        
        # Convert string to int if needed
        user_id = int(user_id) if isinstance(user_id, str) else user_id
        
        notes = Note.query.filter_by(user_id=user_id).order_by(Note.updated_at.desc()).all()
        print(f"Found {len(notes)} notes")
        
        return jsonify([{
            'id': n.id, 
            'title': n.title, 
            'content': n.content,
            'position': n.get_position(),
            'size': n.get_size(),  # ADD THIS
            'created_at': n.created_at.isoformat() if n.created_at else None,
            'updated_at': n.updated_at.isoformat() if n.updated_at else None
        } for n in notes]), 200
        
    except Exception as e:
        print(f"Error fetching notes: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Error fetching notes', 'error': str(e)}), 500

@notes_bp.route('/notes', methods=['POST'])
@jwt_required()
def create_note():
    try:
        user_id = get_jwt_identity()
        print(f"Creating note for user_id: {user_id}")
        
        # Convert string to int if needed
        user_id = int(user_id) if isinstance(user_id, str) else user_id
        
        data = request.json
        print(f"Note data: {data}")
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        title = data.get('title')
        content = data.get('content', '')
        position = data.get('position')
        size = data.get('size')  # ADD THIS
        
        if not title:
            return jsonify({'message': 'Title is required'}), 400
        
        note = Note(
            user_id=user_id, 
            title=title, 
            content=content,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Set position if provided
        if position and isinstance(position, dict):
            note.position = json.dumps(position)
        
        # Set size if provided
        if size and isinstance(size, dict):
            note.size = json.dumps(size)
        
        db.session.add(note)
        db.session.commit()
        
        print(f"Note created successfully: ID {note.id}")
        
        return jsonify({
            'message': 'Note created', 
            'id': note.id,
            'note': {
                'id': note.id,
                'title': note.title,
                'content': note.content,
                'position': note.get_position(),
                'size': note.get_size(),
                'created_at': note.created_at.isoformat(),
                'updated_at': note.updated_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating note: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Error creating note', 'error': str(e)}), 500

@notes_bp.route('/notes/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id) if isinstance(user_id, str) else user_id
        
        note = Note.query.get_or_404(note_id)
        
        if note.user_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.json
        note.title = data.get('title', note.title)
        note.content = data.get('content', note.content)
        
        # Update position if provided
        if 'position' in data and isinstance(data['position'], dict):
            note.position = json.dumps(data['position'])
        
        # Update size if provided
        if 'size' in data and isinstance(data['size'], dict):
            note.size = json.dumps(data['size'])
        
        note.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Note updated',
            'note': {
                'id': note.id,
                'title': note.title,
                'content': note.content,
                'position': note.get_position(),
                'size': note.get_size(),
                'updated_at': note.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating note: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Error updating note', 'error': str(e)}), 500

@notes_bp.route('/notes/<int:note_id>', methods=['PATCH'])
@jwt_required()
def patch_note(note_id):
    """Patch endpoint for updating position and/or size"""
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id) if isinstance(user_id, str) else user_id
        
        note = Note.query.get_or_404(note_id)
        
        if note.user_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.json
        updated = False
        
        # Update position if provided
        if 'position' in data and isinstance(data['position'], dict):
            note.position = json.dumps(data['position'])
            updated = True
        
        # Update size if provided (ADD THIS)
        if 'size' in data and isinstance(data['size'], dict):
            note.size = json.dumps(data['size'])
            updated = True
        
        if updated:
            note.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': 'Note updated',
                'position': note.get_position(),
                'size': note.get_size()
            }), 200
        
        return jsonify({'message': 'No valid data provided'}), 400
        
    except Exception as e:
        db.session.rollback()
        print(f"Error patching note: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Error updating note', 'error': str(e)}), 500

@notes_bp.route('/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id) if isinstance(user_id, str) else user_id
        
        note = Note.query.get_or_404(note_id)
        
        if note.user_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({'message': 'Note deleted'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting note: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Error deleting note', 'error': str(e)}), 500