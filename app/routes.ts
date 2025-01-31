import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('articles', 'routes/articles.tsx'),
  route('login', 'routes/login.tsx'),
] satisfies RouteConfig
