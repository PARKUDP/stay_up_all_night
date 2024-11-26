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
    try:
        title = request.json.get('title')
        deadline_str = request.json.get('deadline')
        class_id = request.json.get('class_id')

        if not title or not deadline_str or not class_id:
            return jsonify({'error': 'タイトル、期限、クラスIDを入力してください。'}), 400

        # クラスIDが存在するか確認
        class_instance = Class.query.get(class_id)
        if not class_instance:
            return jsonify({'error': '指定されたクラスが存在しません。'}), 404

        # 日付形式のバリデーション
        try:
            deadline = datetime.strptime(deadline_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': '期限の日付形式が正しくありません (YYYY-MM-DD)。'}), 400

        # 新しい課題を作成
        new_assignment = Assignment(title=title, class_id=class_id, deadline=deadline)
        db.session.add(new_assignment)
        db.session.commit()

        # 初期状態で `AssignmentStatus` を作成
        users = User.query.all()  # クラス内のユーザー全員を取得
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
            'completionCount': 0,  # 初回登録時は 0 人
            'status': '未着手'
        }), 201
    except Exception as e:
        print(f"Error adding assignment: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500


@app.route('/classes/<int:class_id>/assignments', methods=['GET'])
def get_assignments(class_id):
    try:
        # クラスの存在確認
        class_instance = Class.query.get(class_id)
        if not class_instance:
            return jsonify({'error': 'Class not found'}), 404

        # 課題の取得
        assignments = Assignment.query.filter_by(class_id=class_id).all()
        assignments_data = []

        for assignment in assignments:
            try:
                # 完了者数を正確にカウント
                completion_count = AssignmentStatus.query.filter_by(
                    assignment_id=assignment.id, status='完了').count()
            except Exception as e:
                print(f"Error fetching completion count for assignment {assignment.id}: {e}")
                completion_count = 0

            assignments_data.append({
                'id': assignment.id,
                'title': assignment.title,
                'deadline': assignment.deadline.strftime('%Y-%m-%d'),
                'completionCount': completion_count,  # 正確な完了人数を含める
                'status': '未着手'  # 必要に応じてユーザーのステータスを追加
            })

        return jsonify({
            'class_name': class_instance.name,
            'assignments': assignments_data
        }), 200
    except Exception as e:
        print(f"Error in get_assignments: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/assignments/<int:assignment_id>/status', methods=['PUT'])
def update_assignment_status(assignment_id):
    try:
        request_data = request.get_json()
        user_id = request_data.get('user_id')
        new_status = request_data.get('status')

        if not user_id or not new_status:
            return jsonify({'error': 'user_id と status の両方が必要です。'}), 400

        # `AssignmentStatus` エントリを確認
        assignment_status = AssignmentStatus.query.filter_by(user_id=user_id, assignment_id=assignment_id).first()

        if not assignment_status:
            # エントリがない場合、新規作成
            assignment_status = AssignmentStatus(user_id=user_id, assignment_id=assignment_id, status=new_status)
            db.session.add(assignment_status)
        else:
            # エントリがある場合、ステータスを更新
            assignment_status.status = new_status

        db.session.commit()

        # 完了数をカウント
        completion_count = AssignmentStatus.query.filter_by(assignment_id=assignment_id, status='完了').count()

        return jsonify({'message': 'ステータスが更新されました。', 'completionCount': completion_count}), 200
    except Exception as e:
        print(f"Error updating assignment status for assignment {assignment_id}: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

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


if __name__ == '__main__':
    app.run(debug=True)

