from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, Class, Assignment
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'a036ede25b96f82fa9bed3ebd0901f491b7fadbd8b15ddfbe3a44ed88cbdd59c'  

jwt = JWTManager(app)

db.init_app(app)

with app.app_context():
    db.create_all()


@app.route('/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')

    print(f"Received username: {username}, password: {password}")

    if not username or not password:
        return jsonify({'error': 'UsernameとPasswordを入力してください。'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'すでにあります。'}), 400

    # 'pbkdf2:sha256' を使う
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, password=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': '会員登録完了しました'}), 201

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    print(f"Received login request: {username}, {password}")  

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        print("Invalid credentials")  
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user.id)
    print("Login successful, token created")  
    return jsonify({'message': 'Login successful', 'token': access_token}), 200

@app.route('/classes', methods=['GET', 'POST'])
@jwt_required()
def classes():
    current_user_id = get_jwt_identity()
    
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
@jwt_required()
def get_assignments(class_id):
    class_instance = Class.query.get_or_404(class_id)
    assignments = Assignment.query.filter_by(class_id=class_id).all()
    return jsonify({
        'class_name': class_instance.name,
        'assignments': [{'id': a.id, 'title': a.title, 'completed': a.completed} for a in assignments]
    })

@app.route('/assignments', methods=['POST'])
@jwt_required()
def add_assignment():
    title = request.json.get('title')
    class_id = request.json.get('class_id')

    new_assignment = Assignment(title=title, class_id=class_id)
    db.session.add(new_assignment)
    db.session.commit()
    return jsonify({'id': new_assignment.id, 'title': new_assignment.title}), 201

# 授業削除エンドポイント (JWT保護)
@app.route('/classes/<int:class_id>', methods=['DELETE'])
@jwt_required()
def delete_class(class_id):
    class_to_delete = Class.query.get_or_404(class_id)
    db.session.delete(class_to_delete)
    db.session.commit()
    return jsonify({'message': 'Class and related assignments deleted'}), 200

# 課題削除エンドポイント (JWT保護)
@app.route('/assignments/<int:assignment_id>', methods=['DELETE'])
@jwt_required()
def delete_assignment(assignment_id):
    assignment_to_delete = Assignment.query.get_or_404(assignment_id)
    db.session.delete(assignment_to_delete)
    db.session.commit()
    return jsonify({'message': 'Assignment deleted'}), 200

if __name__ == '__main__':
    app.run(debug=True)