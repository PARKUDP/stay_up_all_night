from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from models import db, Class, Assignment  
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/classes', methods=['GET', 'POST'])
def classes():
    if request.method == 'GET':
        all_classes = Class.query.all()
        return jsonify([{'id': c.id, 'name': c.name} for c in all_classes])
    elif request.method == 'POST':
        try:
            name = request.json.get('name')
            if not name:
                return jsonify({'error': 'Class name is required'}), 400
            new_class = Class(name=name)
            db.session.add(new_class)
            db.session.commit()
            return jsonify({'id': new_class.id, 'name': new_class.name}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/classes/<int:class_id>/assignments', methods=['GET'])
def get_assignments(class_id):
    class_instance = Class.query.get_or_404(class_id)
    assignments = Assignment.query.filter_by(class_id=class_id).all()
    return jsonify({
        'class_name': class_instance.name,
        'assignments': [{'id': a.id, 'title': a.title, 'completed': a.completed} for a in assignments]
    })

@app.route('/assignments', methods=['POST'])
def add_assignment():
    title = request.json.get('title')
    class_id = request.json.get('class_id')

    new_assignment = Assignment(title=title, class_id=class_id)
    db.session.add(new_assignment)
    db.session.commit()
    return jsonify({'id': new_assignment.id, 'title': new_assignment.title}), 201

@app.route('/classes/<int:class_id>', methods=['DELETE'])
def delete_class(class_id):
    class_to_delete = Class.query.get_or_404(class_id)
    db.session.delete(class_to_delete)
    db.session.commit()
    return jsonify({'message': 'Class and related assignments deleted'}), 200

@app.route('/assignments/<int:assignment_id>', methods=['DELETE'])
def delete_assignment(assignment_id):
    assignment_to_delete = Assignment.query.get_or_404(assignment_id)
    db.session.delete(assignment_to_delete)
    db.session.commit()
    return jsonify({'message': 'Assignment deleted'}), 200

if __name__ == '__main__':
    app.run(debug=True)