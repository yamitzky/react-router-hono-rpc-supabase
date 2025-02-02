import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { resolver, validator as vValidator } from 'hono-openapi/valibot'
import * as v from 'valibot'
import { authorized } from '~/middleware/authMiddleware'
import { getRepositories } from '~/middleware/repositoryMiddleware'
import { ArticleSchema } from '../models/article'

const ArticleWithoutIdSchema = v.omit(ArticleSchema, ['id'])

const ArticlesResponseSchema = v.object({
  articles: v.array(ArticleSchema),
})
type ArticlesResponse = v.InferOutput<typeof ArticlesResponseSchema>

const ArticleResponseSchema = v.object({
  article: ArticleSchema,
})
type ArticleResponse = v.InferOutput<typeof ArticleResponseSchema>

const ArticleQuerySchema = v.optional(
  v.object({
    // limit: v.optional(v.number()),
    // offset: v.optional(v.number()),
    limit: v.optional(v.pipe(v.string(), v.transform(Number))),
    offset: v.optional(v.pipe(v.string(), v.transform(Number))),
    // offset: z.string().pipe(z.coerce.number().min(1).max(20)).optional(),
  }),
)

const ArticleParamSchema = v.object({ id: v.string() })

export const articleRoutes = new Hono()
  .use(authorized)
  .get(
    '/:id',
    describeRoute({
      description: 'Get article by id',
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              schema: resolver(ArticleResponseSchema),
            },
          },
        },
        404: {
          description: 'Article not found',
        },
      },
    }),
    vValidator('param', ArticleParamSchema),
    async (c) => {
      const { articleRepository } = getRepositories(c)
      const id = c.req.valid('param').id
      const article = await articleRepository.findById(id)

      if (!article) {
        return c.text('Article not found', 404)
      }

      const response = { article } satisfies ArticleResponse
      return c.json(response, 200)
    },
  )
  .get(
    '/',
    describeRoute({
      description: 'Get articles with optional author query',
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              schema: resolver(ArticlesResponseSchema),
            },
          },
        },
      },
    }),
    vValidator('query', ArticleQuerySchema),
    async (c) => {
      const { articleRepository } = getRepositories(c)
      const query = c.req.valid('query')

      const articles = await articleRepository.findAll(query)

      const response = {
        articles,
      } satisfies ArticlesResponse
      return c.json(response)
    },
  )
  .post(
    '/',
    describeRoute({
      description: 'Create article',
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              schema: resolver(ArticleResponseSchema),
            },
          },
        },
      },
    }),
    vValidator('json', ArticleWithoutIdSchema),
    async (c) => {
      const { articleRepository } = getRepositories(c)
      const data = c.req.valid('json')
      const article = await articleRepository.create(data)

      const response = { article } satisfies ArticleResponse
      return c.json(response)
    },
  )
  .put(
    '/:id',
    describeRoute({
      description: 'Update article',
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              schema: resolver(ArticleResponseSchema),
            },
          },
        },
        404: {
          description: 'Article not found',
        },
      },
    }),
    vValidator('param', ArticleParamSchema),
    vValidator('json', v.partial(ArticleWithoutIdSchema)),
    async (c) => {
      const { articleRepository } = getRepositories(c)
      const id = c.req.valid('param').id
      const data = c.req.valid('json')

      const existingArticle = await articleRepository.findById(id)
      if (!existingArticle) {
        return c.text('Article not found', 404)
      }

      const article = await articleRepository.update(id, data)

      const response = { article } satisfies ArticleResponse
      return c.json(response)
    },
  )
  .delete(
    '/:id',
    describeRoute({
      description: 'Delete article',
      responses: {
        200: {
          description: 'OK',
        },
        404: {
          description: 'Article not found',
        },
      },
    }),
    vValidator('param', ArticleParamSchema),
    async (c) => {
      const { articleRepository } = getRepositories(c)
      const id = c.req.valid('param').id

      const existingArticle = await articleRepository.findById(id)
      if (!existingArticle) {
        return c.text('Article not found', 404)
      }

      await articleRepository.delete(id)
      return c.json({ message: 'Article deleted successfully' })
    },
  )
