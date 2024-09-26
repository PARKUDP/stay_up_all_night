from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)
    class_obj = db.relationship('Class', backref=db.backref('assignments', cascade="all, delete-orphan"))
