# 安羅夕雅OS — AI Soccer Coach

世界に1人、**安羅夕雅**専用のパーソナルAIサッカーコーチアプリ。目的はひとつ、22歳までに彼をプロサッカー選手にすること。一般ユーザー向け機能は存在しません。

## 機能

- **ホーム画面** — プロ指数（100点満点）、今日の体重・睡眠・痛み、AIが毎日自動生成するタスク、22歳までの残り日数、レベル/XP
- **能力値** — パス・スルーパス・キック・キープ力・視野・戦術理解・守備・アジリティ・メンタル・レジリエンスをレーダーチャートで表示
- **トレーニング管理** — サッカー練習（練習時間・自主練・ボールタッチ数・動画分析時間）と筋トレ（種目・重量・回数・セット）を毎日記録し、履歴とグラフで可視化
- **ACL管理** — 左膝ACL断裂3回の既往を前提に、痛み・不安感・腫れ・可動域を毎日記録し、AIが再受傷リスクを分析
- **試合分析** — 出場時間・ゴール・アシスト・パス成功率・スルーパス・キーパス・ボール奪取/ロストと自己評価を記録
- **AI映像分析** — スクワット動作（MediaPipe骨格認識で左右差・深さ・膝の向き・ACLリスク）と試合映像（ボールタッチ・パス・ロスト・守備行動）をアップロード分析
- **AI監督** — 過去データ（プロ指数・ACL状態・練習量・試合成績）を根拠に、毎朝コーチングメッセージと集中項目を提示
- **人生RPG** — 練習・筋トレ・試合・映像分析・タスク完了でXPを獲得し、レベルアップ

## 技術構成

| レイヤー | 技術 |
| --- | --- |
| Frontend | Next.js (App Router), TypeScript, TailwindCSS v4 |
| UI | 自作グラスモーフィズムコンポーネント（shadcn/ui 相当の構成方針）, lucide-react, recharts |
| Backend | Server Actions + Route Handlers |
| データ永続化 | ローカルJSONストア（`data/store.json`）— [Supabaseスキーマ](./supabase/schema.sql) 定義済みで本番移行可能 |
| AI | Anthropic Claude API（コーチング・タスク生成）, ルールベースAIをフォールバックとして常時搭載 |
| 映像分析 | MediaPipe + OpenCV（[scripts/pose_analysis](./scripts/pose_analysis)、外部サービスとして接続可能）。未接続時は決定論的シミュレーションでUIを完全に動作確認可能 |

> package.json 上は `next@latest`（現時点で 16.x）を使用しています。App Router の構成・API はNext.js 15と同一です。

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` を開くとアプリが起動します。外部サービスを何も設定しなくても、ローカルJSONストアとルールベースAIで全機能が動作します。

### 環境変数（すべて任意）

`.env.example` を `.env.local` にコピーして必要な値を設定してください。

- `ANTHROPIC_API_KEY` — 設定するとAI監督メッセージ・今日のタスクがClaudeによって生成されます（未設定時はルールベース生成）
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — 設定すると本番バックエンドをSupabaseに切り替え可能（[supabase/schema.sql](./supabase/schema.sql) を実行してから、`src/lib/db/repo.ts` の実装を `src/lib/db/supabase.ts` 経由に置き換えてください。テーブル定義は現在のローカルストアと1:1で対応しています）
- `VIDEO_ANALYSIS_SERVICE_URL` — [scripts/pose_analysis](./scripts/pose_analysis) を元にした実際のMediaPipe/OpenCVサービスをデプロイした場合のエンドポイント

## ディレクトリ構成

```
src/
  app/                 # ページ（App Router）と Server Actions
  components/          # UIコンポーネント（グラスカード、レーダーチャート等）
  lib/
    types.ts           # ドメイン型定義
    seed.ts            # 安羅夕雅のプロフィール初期データ
    proIndex.ts         # プロ指数の算出ロジック
    xp.ts               # レベル/XPシステム
    db/                 # データ永続化（ローカルJSON / Supabase）
    ai/                 # AI監督・タスク生成・ACLリスク分析・映像分析
scripts/pose_analysis/  # MediaPipe/OpenCVによる実映像分析パイプライン（参照実装）
supabase/schema.sql      # 本番移行用スキーマ
```
