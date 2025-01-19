# React Router + Hono RPC

React Router(Remix) と Hono を組み合わせたプロジェクトです。

## 技術スタック

- React Router (Remix) によるフロントエンドの構築
  - HeroUI (NextUI) と Tailwind CSS によるスタイリングの導入
- Hono による API サーバー (RPC)
  - Vitest による API サーバーのテスト
  - Valibot でのバリデーション
  - OpenAPI による API 仕様の自動生成
- Node でのデプロイ

## コマンド

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# 型チェック
pnpm typecheck

# テストの実行
pnpm test

# プロダクションビルド
pnpm build

# プロダクションサーバーの起動
pnpm start
```

## ライセンス

[The MIT License](./LICENSE)
