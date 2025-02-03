# React Router + Hono RPC

React Router(Remix) と Hono を組み合わせたプロジェクトです。

## 技術スタック

- [React Router (Remix)](https://reactrouter.com/) によるフロントエンドの構築
  - [HeroUI (NextUI)](https://www.heroui.com/) と Tailwind CSS によるスタイリングの導入
- [Hono](https://hono.dev) による API サーバー ([RPC](https://hono.dev/docs/guides/rpc))
  - [Vitest](https://vitest.dev/) による API サーバーのテスト
  - [Valibot](https://valibot.dev/) でのバリデーション
  - [hono-openapi](https://hono.dev/examples/hono-openapi) による API 仕様の自動生成
- [hono-remix](https://github.com/sergiodxa/remix-hono) での Hono と React Router の統合
- Node 環境でのデプロイ
- [Hono Context](https://hono.dev/docs/api/context#var) での API、Remix への依存注入
- Supabase での認証 (Hono、React Routerのloader、JavaScript)
- Supabase でのデータベースへのCRUD (Hono)

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
