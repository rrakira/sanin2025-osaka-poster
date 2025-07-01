# 参院選2025 大阪府選挙ポスター貼り付け状況

選挙ポスターの貼り付け状況をチーム間でリアルタイム共有するためのWebアプリケーションです。

## 機能

- **市町村選択**: 吹田市と箕面市を切り替えて表示
- **投票区管理**: 各投票区ごとの掲示場所一覧を表示
- **チェック機能**: 
  - 投票区レベルでの一括チェック/チェック解除
  - 個別掲示場所のチェック管理
  - 部分的にチェックされた投票区の中間状態表示
- **メモ機能**: 投票区および各掲示場所にメモを追記
- **リアルタイム共有**: データベースを使用したチーム間でのデータ同期
- **レスポンシブデザイン**: スマートフォン対応UI

## 技術仕様

- **フロントエンド**: React 18
- **バックエンド**: Node.js + Express
- **データベース**: PostgreSQL
- **スタイリング**: CSS3 (カスタムスタイル)
- **ホスティング**: Render.com (Web Service + PostgreSQL)

## アーキテクチャ

```
[React Frontend] ←→ [Express API Server] ←→ [PostgreSQL Database]
      ↓                    ↓                      ↓
   UI/UX制御         REST API提供          データ永続化
```

## データベーススキーマ

```sql
CREATE TABLE poster_states (
  id SERIAL PRIMARY KEY,
  city VARCHAR(10) NOT NULL,           -- 'minoo' or 'suita'
  district_id VARCHAR(10) NOT NULL,    -- 投票区ID
  location_id VARCHAR(10),             -- 掲示場所ID (NULL=投票区全体)
  is_checked BOOLEAN DEFAULT FALSE,    -- チェック状態
  memo TEXT DEFAULT '',               -- メモ内容
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(city, district_id, location_id)
);
```

## API エンドポイント

### GET `/api/states/:city`
指定した市のチェック状態とメモを取得

### POST `/api/states/check`
チェック状態を更新
```json
{
  "city": "minoo",
  "districtId": "1",
  "locationId": "1",
  "isChecked": true
}
```

### POST `/api/states/memo`
メモを更新
```json
{
  "city": "minoo", 
  "districtId": "1",
  "locationId": "1",
  "memo": "作業完了"
}
```

## セットアップ

### 開発環境

1. **依存関係のインストール**
```bash
npm install
```

2. **環境変数の設定**
```bash
# .envファイルを作成
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/poster_app
```

3. **PostgreSQLデータベースの準備**
```bash
# ローカルでPostgreSQLを起動
# データベースは自動的に初期化されます
```

4. **開発サーバー起動**
```bash
# フロントエンドとバックエンドを同時起動
npm run dev

# または個別起動
npm run server  # バックエンドのみ
npm run client  # フロントエンドのみ
```

### 本番環境デプロイ (Render.com)

1. **GitHubリポジトリを準備**
```bash
git add .
git commit -m "Add database integration"
git push origin main
```

2. **Render.comでサービスを作成**
   - Web Service を選択
   - GitHubリポジトリを接続
   - `render.yaml`で自動設定される

3. **PostgreSQLデータベースを接続**
   - Render.comが自動的にDATABASE_URL環境変数を設定
   - アプリ起動時にテーブルが自動作成される

## 使用方法

### 基本操作

1. **市町村選択**: 上部のタブで吹田市・箕面市を切り替え
2. **投票区の表示**: 投票区名をクリックして掲示場所一覧を展開
3. **チェック管理**: 
   - 投票区チェックボックス: その投票区の全掲示場所を一括管理
   - 掲示場所チェックボックス: 個別の進捗管理
4. **メモ入力**: 「📝 メモを追加」ボタンでメモ欄を表示

### チーム運用

- **リアルタイム同期**: チェックやメモの変更は即座にデータベースに保存
- **複数ユーザー**: 同時に複数人が作業可能
- **データ永続化**: ブラウザを閉じても状態が保持
- **履歴管理**: updated_atで最終更新時刻を記録

## データファイル

- `public/minoo.csv`: 箕面市の掲示場所データ (273箇所)
- `public/suita.csv`: 吹田市の掲示場所データ (442箇所)

## 環境変数

### 本番環境 (Render.com)
- `NODE_ENV=production`
- `DATABASE_URL` (自動設定)

### 開発環境
- `NODE_ENV=development`
- `PORT=5000`
- `DATABASE_URL=postgresql://...`

## トラブルシューティング

### データベース接続エラー
```bash
# ログを確認
npm start

# DATABASE_URLが正しく設定されているか確認
echo $DATABASE_URL
```

### API通信エラー
- ネットワーク接続を確認
- ブラウザの開発者ツールでエラーログを確認
- サーバーログでエラー詳細を確認 