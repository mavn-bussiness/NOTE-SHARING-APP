from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    notes = db.relationship('Note', backref='user', lazy=True, cascade='all, delete-orphan')

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=True)
    position = db.Column(db.Text, nullable=True)
    size = db.Column(db.Text, nullable=True)  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_position(self):
        if self.position:
            try:
                return json.loads(self.position)
            except:
                return None
        return None

    def set_position(self, x, y):
        self.position = json.dumps({'x': x, 'y': y})

    def get_size(self):
        if self.size:
            try:
                return json.loads(self.size)
            except:
                return None
        return None

    def set_size(self, width, height):
        self.size = json.dumps({'width': width, 'height': height})
