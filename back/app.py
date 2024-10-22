from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_cors import CORS
from datetime import datetime
from models import db, User, Class, Assignment
from flask_migrate import Migrate


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'c5eb7bbe26e1426893e44c80985e049a60e322a00fd075f351917a87f40134ce'

db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

@app.route('/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({'error': 'UsernameとPasswordを入力してください。'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'すでにそのユーザー名は使用されています。'}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': '会員登録完了しました'}), 201

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({'error': 'Usernameとpasswordを入力してください。'}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': '無効な資格情報です。'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({'message': 'Login successful', 'token': access_token}), 200

@app.route('/assignments', methods=['POST'])
@jwt_required()
def add_assignment():
    title = request.json.get('title')
    deadline_str = request.json.get('deadline')
    class_id = request.json.get('class_id')

    if not title or not deadline_str or not class_id:
        return jsonify({'error': 'タイトル、期限、クラスIDを入力してください。'}), 400

    try:
        deadline = datetime.strptime(deadline_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': '期限の日付形式が正しくありません。'}), 400

    new_assignment = Assignment(title=title, class_id=class_id, deadline=deadline)
    db.session.add(new_assignment)
    db.session.commit()

    return jsonify({'id': new_assignment.id, 'title': new_assignment.title, 'deadline': new_assignment.deadline}), 201

@app.route('/classes/<int:class_id>/assignments', methods=['GET'])
@jwt_required()
def get_assignments(class_id):
    class_instance = Class.query.get_or_404(class_id)
    assignments = Assignment.query.filter_by(class_id=class_id).all()
    return jsonify({
        'class_name': class_instance.name,
        'assignments': [
            {'id': a.id, 'title': a.title, 'completed': a.completed, 'term': a.term, 'deadline': a.deadline.strftime('%Y-%m-%d')}
            for a in assignments
        ]
    })

@app.route('/classes', methods=['GET', 'POST'])
@jwt_required()
def classes():
    if request.method == 'GET':
        all_classes = Class.query.all()
        return jsonify([{'id': c.id, 'name': c.name} for c in all_classes])
    
    elif request.method == 'POST':
        name = request.json.get('name')
        if not name:
            return jsonify({'error': 'クラス名が必要です。'}), 400
        new_class = Class(name=name)
        db.session.add(new_class)
        db.session.commit()
        return jsonify({'id': new_class.id, 'name': new_class.name}), 201

@app.route('/classes/<int:class_id>', methods=['DELETE'])
@jwt_required()
def delete_class(class_id):
    class_to_delete = Class.query.get_or_404(class_id)
    db.session.delete(class_to_delete)
    db.session.commit()
    return jsonify({'message': 'Class and related assignments deleted'}), 200

@app.route('/assignments/<int:assignment_id>', methods=['DELETE'])
@jwt_required()
def delete_assignment(assignment_id):
    assignment_to_delete = Assignment.query.get_or_404(assignment_id)
    db.session.delete(assignment_to_delete)
    db.session.commit()
    return jsonify({'message': 'Assignment deleted'}), 200

if __name__ == '__main__':
    app.run(debug=True)