import type { Article } from '../models/article'

export interface ArticleRepository {
  findById(id: string): Promise<Article | undefined>
  findAll(params?: {
    limit?: number
    offset?: number
  }): Promise<Article[]>
  create(article: Omit<Article, 'id' | 'createdAt'>): Promise<Article>
  update(id: string, article: Partial<Article>): Promise<Article>
  delete(id: string): Promise<void>
}
