from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Hello World!"

@app.route('/api/message', methods=['GET'])
def get_message():
    return jsonify({"message": "今日も徹夜"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

