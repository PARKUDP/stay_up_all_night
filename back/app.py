from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from models import db, User, Class, Assignment, AssignmentCompletion, AssignmentStatus
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.db" 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

@app.route('/', methods=['GET'])
def hello_word():
    return 'Hello Enpit!!!!'

@app.route('/register', methods=['POST'])
def register():
    try:
        username = request.json.get('username')
        password = request.json.get('password')

        print(f"Received data: username={username}, password={'***' if password else None}")

        if not username or not password:
            return jsonify({'error': 'UsernameとPasswordを入力してください。'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'すでにそのユーザー名は使用されています。'}), 400

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': '会員登録完了しました'}), 201

    except Exception as e:
        print(f"Error in register endpoint: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500


@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({'error': 'Usernameとpasswordを入力してください。'}), 400

    # ユーザーを検索
    user = User.query.filter_by(username=username).first()

    # ユーザーが存在しない、またはパスワードが一致しない場合
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': '無効な資格情報です。'}), 401

    # ログイン成功時のレスポンス
    return jsonify({
        'message': 'Login successful',
        'user_id': user.id  # ユーザーIDを返す
    }), 200


@app.route('/assignments', methods=['POST'])
def add_assignment():
    title = request.json.get('title')
    deadline_str = request.json.get('deadline')
    class_id = request.json.get('class_id')

    if not title or not deadline_str or not class_id:
        return jsonify({'error': 'タイトル、期限、クラスIDを入力してください。'}), 400

    # クラスIDが存在するか確認
    class_instance = Class.query.get(class_id)
    if not class_instance:
        return jsonify({'error': '指定されたクラスが存在しません。'}), 404

    # 同じクラス内で同じタイトルの課題が存在するかを確認
    existing_assignment = Assignment.query.filter_by(title=title, class_id=class_id).first()
    if existing_assignment:
        return jsonify({'error': '同じ名前の課題がすでに存在します。'}), 400

    # 日付形式のバリデーション
    try:
        deadline = datetime.strptime(deadline_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': '期限の日付形式が正しくありません。'}), 400

    # 新しい課題を作成
    new_assignment = Assignment(title=title, class_id=class_id, deadline=deadline)
    db.session.add(new_assignment)
    db.session.commit()

    # 初期状態のステータスを全ユーザー分作成
    users = User.query.all()
    for user in users:
        new_status = AssignmentStatus(
            user_id=user.id,
            assignment_id=new_assignment.id,
            status='未着手'
        )
        db.session.add(new_status)

    db.session.commit()

    return jsonify({
        'id': new_assignment.id,
        'title': new_assignment.title,
        'deadline': new_assignment.deadline.strftime('%Y-%m-%d'),
        'completionCount': 0,
        'status': '未着手'
    }), 201


@app.route('/classes/<int:class_id>/assignments', methods=['GET'])
def get_assignments(class_id):
    try:
        user_id = request.args.get('user_id')  # URLパラメータからユーザーIDを取得
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        class_instance = Class.query.get(class_id)
        if not class_instance:
            return jsonify({'error': 'Class not found'}), 404

        assignments = Assignment.query.filter_by(class_id=class_id).all()
        assignments_data = []

        for assignment in assignments:
            # ユーザー固有のステータスを取得
            status = AssignmentStatus.query.filter_by(
                user_id=user_id,
                assignment_id=assignment.id
            ).first()

            completion_count = AssignmentStatus.query.filter_by(
                assignment_id=assignment.id,
                status='完了'
            ).count()

            assignments_data.append({
                'id': assignment.id,
                'title': assignment.title,
                'deadline': assignment.deadline.strftime('%Y-%m-%d'),
                'completionCount': completion_count,
                'status': status.status if status else '未着手',
                'details': assignment.details,
                'advice': assignment.advice
            })

        return jsonify({
            'class_name': class_instance.name,
            'assignments': assignments_data
        }), 200

    except Exception as e:
        print(f"Error in get_assignments: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/assignments/<int:assignment_id>/status', methods=['PUT'])
def update_assignment_status(assignment_id):
    try:
        data = request.json
        user_id = data.get('user_id')
        new_status = data.get('status')

        if not all([user_id, new_status]):
            return jsonify({'error': 'Missing required fields'}), 400

        # 既存のステータスを検索
        status = AssignmentStatus.query.filter_by(
            user_id=user_id,
            assignment_id=assignment_id
        ).first()

        if status:
            # 既存のステータスを更新
            status.status = new_status
        else:
            # 新規ステータスを作成
            status = AssignmentStatus(
                user_id=user_id,
                assignment_id=assignment_id,
                status=new_status
            )
            db.session.add(status)

        # 完了人数を取得
        completion_count = AssignmentStatus.query.filter_by(
            assignment_id=assignment_id,
            status='完了'
        ).count()

        db.session.commit()
        return jsonify({
            'message': 'Status updated successfully',
            'completionCount': completion_count
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error updating status: {str(e)}")
        return jsonify({'error': 'Failed to update status'}), 500

@app.route('/classes', methods=['GET', 'POST'])
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

@app.route('/assignments/<int:assignment_id>', methods=['GET'])
def get_assignment_details(assignment_id):
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
    
    return jsonify({
        'id': assignment.id,
        'title': assignment.title,
        'deadline': assignment.deadline,
        'details': assignment.details,
        'advice': assignment.advice
    })

@app.route('/assignments/<int:assignment_id>/details', methods=['PUT'])
def update_assignment_details(assignment_id):
    data = request.json
    print(f"Received data for assignment {assignment_id}: {data}")  # デバッグ用ログ

    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404

    try:
        # 現在の値をログ出力
        print(f"Current details: {assignment.details}")
        print(f"Current advice: {assignment.advice}")

        assignment.details = data.get('details', assignment.details)
        assignment.advice = data.get('advice', assignment.advice)

        # 更新後の値をログ出力
        print(f"Updated details: {assignment.details}")
        print(f"Updated advice: {assignment.advice}")

        db.session.commit()
        return jsonify({'message': 'Details updated successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error updating assignment {assignment_id}: {str(e)}")
        return jsonify({'error': 'Failed to update assignment'}), 500

if __name__ == '__main__':
    app.run(debug=True)

