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

export const getRepositories = (c: Context) => {
  return c.get('repositories')
}

export const repositoryMiddleware = (createRepositories: (context: Context) => Repositories) => {
  return async (c: Context, next: Next) => {
    c.set('repositories', createRepositories(c))
    await next()
  }
}
