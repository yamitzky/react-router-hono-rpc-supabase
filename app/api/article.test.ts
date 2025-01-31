import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { repositoryMiddleware } from '../middleware/repositoryMiddleware'
import type { Article } from '../models/article'
import type { ArticleRepository } from '../repositories/articleRepository'
import { articleRoutes } from './articles'

const mockArticleRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  findByAuthorId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} satisfies ArticleRepository

// テスト用のアプリケーションを作成
const app = new Hono()
  .use(
    repositoryMiddleware({
      articleRepository: mockArticleRepository,
    }),
  )
  .route('/', articleRoutes)

describe('Article API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /:id', () => {
    it('should return article when it exists', async () => {
      const testArticle: Article = {
        id: '1',
        title: 'Test Article',
        content: 'Test Content',
        authorId: 'author1',
        createdAt: '2024-01-14T00:00:00.000Z',
      }
      mockArticleRepository.findById.mockResolvedValue(testArticle)

      const res = await testClient(app)[':id'].$get({ param: { id: '1' } })
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.article).toEqual(testArticle)
      expect(mockArticleRepository.findById).toHaveBeenCalledWith('1')
    })

    it('should return 404 when article does not exist', async () => {
      mockArticleRepository.findById.mockResolvedValue(undefined)

      const res = await testClient(app)[':id'].$get({ param: { id: 'nonexistent' } })
      expect(res.status).toBe(404)
      expect(mockArticleRepository.findById).toHaveBeenCalledWith('nonexistent')
    })
  })

  describe('GET /', () => {
    it('should return all articles', async () => {
      const testArticles: Article[] = [
        {
          id: '1',
          title: 'Article 1',
          content: 'Content 1',
          authorId: 'author1',
          createdAt: '2024-01-14T00:00:00.000Z',
        },
        {
          id: '2',
          title: 'Article 2',
          content: 'Content 2',
          authorId: 'author2',
          createdAt: '2024-01-14T00:00:00.000Z',
        },
      ]
      mockArticleRepository.findAll.mockResolvedValue(testArticles)

      const res = await testClient(app).index.$get()
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.articles).toEqual(testArticles)
      expect(mockArticleRepository.findAll).toHaveBeenCalled()
    })

    it('should filter articles by authorId', async () => {
      const testArticles: Article[] = [
        {
          id: '1',
          title: 'Article 1',
          content: 'Content 1',
          authorId: 'author1',
          createdAt: '2024-01-14T00:00:00.000Z',
        },
        {
          id: '2',
          title: 'Article 2',
          content: 'Content 2',
          authorId: 'author2',
          createdAt: '2024-01-15T00:00:00.000Z',
        },
      ]
      mockArticleRepository.findByAuthorId.mockResolvedValue(testArticles)

      const res = await testClient(app).index.$get({ query: { authorId: 'author1' } })
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.articles).toEqual(testArticles)
      expect(mockArticleRepository.findByAuthorId).toHaveBeenCalledWith('author1')
    })
  })

  describe('POST /', () => {
    it('should create a new article', async () => {
      const newArticle = {
        title: 'New Article',
        content: 'New Content',
        authorId: 'author1',
        createdAt: '2024-01-14T00:00:00.000Z',
      }
      const createdArticle = { ...newArticle, id: '1' }
      mockArticleRepository.create.mockResolvedValue(createdArticle)

      const res = await testClient(app).index.$post({ json: newArticle })
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.article).toEqual(createdArticle)
      expect(mockArticleRepository.create).toHaveBeenCalledWith(newArticle)
    })
  })

  describe('PUT /:id', () => {
    it('should update an existing article', async () => {
      const existingArticle: Article = {
        id: '1',
        title: 'Original Title',
        content: 'Original Content',
        authorId: 'author1',
        createdAt: '2024-01-14T00:00:00.000Z',
      }
      const updateData = {
        title: 'Updated Title',
        content: 'Updated Content',
        authorId: 'author1',
        createdAt: '2024-01-14T00:00:00.000Z',
      }
      const updatedArticle = { ...updateData, id: '1' }

      mockArticleRepository.findById.mockResolvedValue(existingArticle)
      mockArticleRepository.update.mockResolvedValue(updatedArticle)

      const res = await testClient(app)[':id'].$put({ param: { id: '1' }, json: updateData })
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.article).toEqual(updatedArticle)
      expect(mockArticleRepository.update).toHaveBeenCalledWith('1', updateData)
    })

    it('should return 404 when updating non-existent article', async () => {
      mockArticleRepository.findById.mockResolvedValue(undefined)

      const updateData = {
        title: 'Updated Title',
        content: 'Updated Content',
        authorId: 'author1',
      }

      const res = await testClient(app)[':id'].$put({ param: { id: 'nonexistent' }, json: updateData })
      expect(res.status).toBe(404)
      expect(mockArticleRepository.findById).toHaveBeenCalledWith('nonexistent')
      expect(mockArticleRepository.update).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /:id', () => {
    it('should delete an existing article', async () => {
      const existingArticle: Article = {
        id: '1',
        title: 'Test Article',
        content: 'Test Content',
        authorId: 'author1',
        createdAt: '2024-01-14T00:00:00.000Z',
      }
      mockArticleRepository.findById.mockResolvedValue(existingArticle)
      mockArticleRepository.delete.mockResolvedValue(undefined)

      const res = await testClient(app)[':id'].$delete({ param: { id: '1' } })
      expect(res.status).toBe(200)
      expect(mockArticleRepository.delete).toHaveBeenCalledWith('1')
    })

    it('should return 404 when deleting non-existent article', async () => {
      mockArticleRepository.findById.mockResolvedValue(undefined)

      const res = await testClient(app)[':id'].$delete({ param: { id: 'nonexistent' } })
      expect(res.status).toBe(404)
      expect(mockArticleRepository.findById).toHaveBeenCalledWith('nonexistent')
      expect(mockArticleRepository.delete).not.toHaveBeenCalled()
    })
  })
})
