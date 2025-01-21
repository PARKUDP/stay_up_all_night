# 課題管理アプリケーション「今日も徹夜」

## デプロイ情報
本アプリケーションは以下のURLでアクセスできます：

https://enpit.parkudp.com/login

## 概要
このアプリケーションは学生の課題管理を効率化するためのWebアプリケーションです。教科ごとの課題を一元管理し、進捗状況を追跡することができます。

## 主な機能
- ユーザー認証（ログイン/会員登録）
- 授業の管理（追加/削除）
- 課題の管理（追加/編集/削除）
- 課題の進捗状況管理（未着手/進行中/完了）
- 課題の詳細情報と変更履歴の管理
- 課題のフィルタリング（期限や状態による絞り込み）
- レスポンシブデザイン対応

## 技術スタック
### フロントエンド
- React 18.3.1
- TypeScript 4.9.5
- React Router 6.26.2
- Axios
- CSS Modules

### バックエンド
- Python/Flask
- SQLAlchemy
- SQLite
- Flask-CORS
- Flask-Migrate

## インストールと実行

### 必要条件
- Node.js 18.x以上
- Python 3.11以上
- Docker & Docker Compose（オプション）

### ローカル環境での実行

1. リポジトリのクローン
```bash
git clone https://github.com/KamineHiro/enPiT2024.git
cd stay_up_all_night
```

2. バックエンドのセットアップ
```bash
python -m venv venv
source venv/bin/activate # Windowsの場合: venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade
python app.py
```

3. フロントエンドのセットアップ
```bash
cd frontend
npm install
npm start
```

### Dockerでの実行
```bash
docker-compose up --build
```

## 開発環境へのアクセス
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:5001

## テスト実行
### フロントエンド
```bash
npm test
```

### バックエンド
```bash
python test.py
```

## データベースのリセット
```bash
cd back
python table_reset.py
```

## 主な機能の使い方

### 1. ユーザー登録とログイン
- 初回利用時は「会員登録」から新規アカウントを作成
- 登録済みの場合は「ログイン」からアクセス

### 2. 授業の管理
- ダッシュボードから「授業を追加する」をクリック
- 授業名を入力して登録
- 不要な授業は削除ボタンから削除可能

### 3. 課題の管理
- 授業を選択して課題一覧を表示
- 「新しい課題を追加」から課題を登録
- 各課題の進捗状況を更新可能
- 課題の詳細情報や変更履歴を確認・編集可能

### 4. フィルタリング機能
- 「すべて」「未着手」「進行中」「完了」で課題を絞り込み
- 期限による絞り込み（1日以内、3日以内、7日以内）が可能

## 注意事項
- 初回起動時はデータベースが空の状態です
- 本番環境での使用時は適切なセキュリティ設定を行ってください
- 大量のデータを扱う場合はSQLiteからより適切なDBMSへの移行を検討してください

## 開発者向け情報
プルリクエストや機能改善の提案は大歓迎です。開発に参加する際は以下の点にご注意ください：

- コードスタイルはプロジェクトの既存の形式に従ってください
- 新機能の追加時は適切なテストを作成してください
- セキュリティに関する修正は優先的に対応します
