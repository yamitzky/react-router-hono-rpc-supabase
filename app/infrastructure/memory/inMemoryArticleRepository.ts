import type { Article } from '../../models/article'

export class InMemoryArticleRepository {
  private articles: Map<string, Article>

  constructor(articles: Article[] = []) {
    this.articles = new Map(articles.map((article) => [article.id, article]))
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9)
  }

  async findById(id: string): Promise<Article | undefined> {
    return this.articles.get(id)
  }

  async findAll(params?: {
    limit?: number
    offset?: number
  }): Promise<Article[]> {
    let articles = Array.from(this.articles.values())

    if (params) {
      if (params.offset !== undefined) {
        articles = articles.slice(params.offset)
      }
      if (params.limit !== undefined) {
        articles = articles.slice(0, params.limit)
      }
    }
    return Array.from(articles)
  }

  async create(articleData: Omit<Article, 'id'>): Promise<Article> {
    const id = this.generateId()
    const article = { ...articleData, id }
    this.articles.set(id, article)
    return article
  }

  async update(id: string, articleData: Partial<Article>): Promise<Article> {
    const current = this.articles.get(id)
    if (!current) {
      throw new Error('Article not found')
    }
    const newData = { ...current, ...articleData }
    this.articles.set(id, newData)
    return newData
  }

  async delete(id: string): Promise<void> {
    this.articles.delete(id)
  }
}
