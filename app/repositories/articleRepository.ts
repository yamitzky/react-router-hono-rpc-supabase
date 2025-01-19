import type { Article } from '../models/article'

export interface ArticleRepository {
  findById(id: string): Promise<Article | undefined>
  findAll(): Promise<Article[]>
  findByAuthorId(authorId: string): Promise<Article[]>
  create(article: Omit<Article, 'id'>): Promise<Article>
  update(id: string, article: Partial<Article>): Promise<Article>
  delete(id: string): Promise<void>
}
