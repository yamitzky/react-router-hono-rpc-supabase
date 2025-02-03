# React Router + Hono RPC

This project combines React Router (Remix) with Hono.

## Technology Stack

- Frontend built with [React Router (Remix)](https://reactrouter.com/)
  - Styling implemented using [HeroUI (NextUI)](https://www.heroui.com/) and Tailwind CSS
- API server ([RPC](https://hono.dev/docs/guides/rpc)) using [Hono](https://hono.dev)
  - API server testing with [Vitest](https://vitest.dev/)
  - Validation using [Valibot](https://valibot.dev/)
  - Automatic API specification generation with [hono-openapi](https://hono.dev/examples/hono-openapi)
- Integration of Hono and React Router using [hono-remix](https://github.com/sergiodxa/remix-hono)
- Deployment on Node environment
- Dependency injection for API and Remix using [Hono Context](https://hono.dev/docs/api/context#var)
- Authentication with Supabase (implemented in Hono, React Router loaders, and JavaScript)
- CRUD operations on Supabase database (implemented in Hono)
- React Suspense

## Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run type checking
pnpm typecheck

# Execute tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## License

[The MIT License](./LICENSE)