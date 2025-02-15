from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    term = db.Column(db.Boolean, default=False)
    deadline = db.Column(db.Date, nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)
    class_obj = db.relationship('Class', backref=db.backref('assignments', cascade="all, delete-orphan"))
    details = db.Column(db.Text, nullable=True)  # 課題の詳細
    advice = db.Column(db.Text, nullable=True)   # 課題のアドバイス

class AssignmentStatus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'), nullable=False)
    status = db.Column(db.String(20), default='未着手')  

    user = db.relationship('User', backref=db.backref('assignment_statuses', cascade="all, delete-orphan"))
    assignment = db.relationship('Assignment', backref=db.backref('statuses', cascade="all, delete-orphan"))

class AssignmentCompletion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False)

class AssignmentDetailHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'), nullable=False)
    details = db.Column(db.Text)
    advice = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    assignment = db.relationship('Assignment', backref=db.backref('history', cascade="all, delete-orphan"))