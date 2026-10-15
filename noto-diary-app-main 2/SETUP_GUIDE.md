# noto セットアップガイド

このドキュメントでは、noto を GitHub からクローンして、ローカル環境で開発・実行する手順を説明します。

## 前提条件

- **Node.js** 16.x 以上
- **npm** 7.x 以上（または yarn）
- **Git**
- モダンブラウザ（Chrome、Firefox、Safari、Edge）

## インストール手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/noto.git
cd noto
```

### 2. 依存パッケージをインストール

```bash
npm install
```

初回は数分かかります。`node_modules/` ディレクトリに全パッケージがインストールされます。

### 3. 開発サーバーを起動

```bash
npm start
```

コマンド実行後、自動的にブラウザが開き、`http://localhost:3000` に接続されます。

```
> noto@0.1.0 start
> react-scripts start

Starting the development server...
```

## 開発中の作業フロー

### ファイル編集後の動作

React Scripts は自動的にファイル変更を検知し、ホットリロードします。
ブラウザをリロードする必要はありません（ほとんどの場合）。

### コンソール出力を確認

ターミナルとブラウザの DevTools（F12）でエラーやログを確認できます。

### 本番ビルド

```bash
npm run build
```

`build/` ディレクトリに最適化されたファイルが生成されます。

## ファイル構成の説明

```
noto/
├── public/
│   ├── index.html         # アプリの入り口
│   ├── manifest.json      # PWA設定
│   └── favicon.ico        # ファビコン
│
├── src/
│   ├── components/
│   │   ├── Sidebar.js     # 左サイドバー
│   │   ├── Sidebar.css
│   │   ├── TagInput.js    # タグ入力コンポーネント
│   │   ├── TagInput.css
│   │   ├── Toast.js       # 通知コンポーネント
│   │   └── Toast.css
│   │
│   ├── data/
│   │   ├── constants.js   # カテゴリ、色、Moodアイコン定義
│   │   └── store.js       # グローバルステート（localStorage連携）
│   │
│   ├── hooks/
│   │   └── useStore.js    # ストア購読フック
│   │
│   ├── pages/
│   │   ├── WritePage.js   # 日記作成画面
│   │   ├── WritePage.css
│   │   ├── ListPage.js    # 日記一覧画面
│   │   ├── ListPage.css
│   │   ├── SearchPage.js  # 検索・フィルター画面
│   │   ├── SearchPage.css
│   │   ├── CalendarPage.js # カレンダー画面
│   │   ├── CalendarPage.css
│   │   ├── KBPage.js      # 知識DB画面
│   │   ├── KBPage.css
│   │   ├── DashPage.js    # ダッシュボード画面
│   │   └── DashPage.css
│   │
│   ├── App.js             # メインアプリコンポーネント
│   ├── App.css
│   ├── index.js           # React マウントポイント
│   └── index.css          # グローバルスタイル
│
├── package.json           # プロジェクト設定・依存パッケージ
├── .gitignore             # Git から除外するファイル
├── .eslintrc.json         # ESLint設定
├── .prettierrc             # Prettier設定
├── README.md              # プロジェクト説明
├── SETUP_GUIDE.md         # このファイル
└── .env.example           # 環境変数テンプレート
```

## データの永続化

### localStorage について

noto はすべてのデータをブラウザの `localStorage` に保存します。

**保存されるデータ：**
- `noto_entries` — 日記の全エントリー（JSON形式）
- `noto_kb` — 知識DBの全アイテム（JSON形式）

**メリット：**
- サーバーが不要
- ローカルで完結（プライバシー保護）
- 高速

**デメリット：**
- ブラウザのキャッシュクリアでデータ消失
- 複数デバイス間での同期不可
- 容量制限あり（通常 5-10MB）

### データのエクスポート

後で実装予定の機能：
- JSON エクスポート
- CSV エクスポート
- PDF 出力

## カスタマイズ例

### カテゴリを追加

`src/data/constants.js` を編集：

```javascript
export const CAT_STYLES = {
  仕事: { dot: '#378ADD', bg: '#E6F1FB', tx: '#0C447C' },
  学習: { dot: '#BA7517', bg: '#FAEEDA', tx: '#633806' },
  日常: { dot: '#1D9E75', bg: '#E1F5EE', tx: '#085041' },
  健康: { dot: '#D4537E', bg: '#FBEAF0', tx: '#72243E' },
  趣味: { dot: '#E84C3D', bg: '#FDEAE5', tx: '#7D2D27' },  // 新規追加
};

export const CATEGORIES = ['仕事', '学習', '日常', '健康', '趣味'];
```

### カラーテーマを変更

同ファイルで各カテゴリの色を変更。16進数カラーコードを指定します。

### ヘッダータイトルを変更

`src/components/Sidebar.js` の `sb-logo` テキストを編集：

```javascript
<div className="sb-logo">myapp<span>.</span></div>
```

## トラブルシューティング

### npm install でエラー

```bash
# npm キャッシュをクリア
npm cache clean --force

# 再度インストール
npm install
```

### ポート 3000 がすでに使用中

```bash
# 別のポートで起動（3001の例）
PORT=3001 npm start
```

### 古いデータが表示される

```javascript
// ブラウザのDevTools（F12）で、以下を実行してlocalStorageをクリア
localStorage.clear();
```

### スタイルが反映されない

```bash
# ブラウザのキャッシュをクリア
# または Ctrl+Shift+Delete（DevTools 内）でキャッシュクリア
```

## 本番環境へのデプロイ

### Vercel（推奨）

```bash
# Vercel CLI をインストール
npm i -g vercel

# プロジェクトディレクトリで実行
vercel
```

Vercel が自動的にビルドしてデプロイします。

### GitHub Pages

`package.json` に追加：

```json
"homepage": "https://yourusername.github.io/noto",
```

```bash
npm run build
npm install --save-dev gh-pages
```

`package.json` の scripts に追加：

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

```bash
npm run deploy
```

### その他のホスティング（Netlify 等）

各サービスのドキュメントに従って、`build/` ディレクトリをデプロイしてください。

## よくある質問（FAQ）

**Q: データをバックアップできますか？**
A: ブラウザの DevTools → Application → localStorage で `noto_entries`, `noto_kb` を確認・コピーできます。

**Q: 複数デバイスでデータを同期したい**
A: 将来、Firebase や Supabase などのバックエンドを追加することで対応予定です。

**Q: AI による自動サマリーは？**
A: Claude API との連携機能は次のフェーズで実装予定です。

## サポート

- GitHub Issues でバグを報告してください
- Discussions で機能リクエストを共有できます

---

**更新日**: 2025年6月
**バージョン**: 0.1.0
