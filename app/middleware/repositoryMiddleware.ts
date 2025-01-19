import type { Context, Next } from 'hono'
import type { ArticleRepository } from '../repositories/articleRepository'

type Repositories = {
  articleRepository: ArticleRepository
}

declare module 'hono' {
  interface ContextVariableMap {
    repositories: Repositories
  }
}

export const createRepositoryMiddleware = (repositories: Repositories) => {
  return async (c: Context, next: Next) => {
    c.set('repositories', repositories)
    await next()
  }
}
