import { Hono } from 'hono'

import { describeRoute } from 'hono-openapi'
import { resolver, validator as vValidator } from 'hono-openapi/valibot'
import * as v from 'valibot'

const querySchema = v.optional(
  v.object({
    title: v.optional(v.string()),
  }),
)

const articleSchema = v.object({
  id: v.string(),
  title: v.string(),
})

const responseSchema = v.object({
  articles: v.array(articleSchema),
})
type Response = v.InferOutput<typeof responseSchema>

export const articleRoutes = new Hono().get(
  '/',
  describeRoute({
    description: 'Say hello to the user',
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': { schema: resolver(responseSchema) },
        },
      },
    },
  }),
  vValidator('query', querySchema),
  async (c) => {
    const titles = [
      'Breaking News: AI Takes Over Coffee Making',
      'The Secret Life of Code Comments',
      'Why Developers Love Pizza: A Scientific Study',
      'Top 10 Keyboard Shortcuts You Never Knew Existed',
      'The Art of Debugging: A Love Story',
    ]
    let articles = titles.map((title) => ({ id: crypto.randomUUID(), title }))
    const queryTitle = c.req.valid('query')?.title
    if (queryTitle) {
      articles = articles.filter((article) => article.title.toLowerCase().includes(queryTitle.toLowerCase()))
    }

    return c.json({
      articles,
    } satisfies Response)
  },
)
