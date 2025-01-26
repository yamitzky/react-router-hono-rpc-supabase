import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { openAPISpecs } from 'hono-openapi'
import process from 'node:process'
import type { AppLoadContext, RequestHandler } from 'react-router'
import { createRequestHandler } from 'react-router'
import { reactRouter } from 'remix-hono/handler'
import apiRoutes from './app/api'
import { InMemoryArticleRepository } from './app/infrastructure/memory/inMemoryArticleRepository'
import { createRepositoryMiddleware } from './app/middleware/repositoryMiddleware'

const app = new Hono<{
  Bindings: {
    MY_VAR: string
  }
}>()

let handler: RequestHandler | undefined

const dummyArticles = [
  {
    id: 'article1',
    title: 'Getting Started with TypeScript',
    content: 'TypeScript is a powerful superset of JavaScript...',
    authorId: 'author1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'article2',
    title: 'Web Development Best Practices',
    content: 'Here are some essential web development practices...',
    authorId: 'author1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'article3',
    title: 'Introduction to API Design',
    content: 'When designing APIs, it is important to consider...',
    authorId: 'author2',
    createdAt: new Date().toISOString(),
  },
]
const repositories = {
  articleRepository: new InMemoryArticleRepository(dummyArticles),
}
const repositoryMiddleware = createRepositoryMiddleware(repositories)
app.use(repositoryMiddleware)

app.route('/api', apiRoutes)
app.get('/hono', (c) => c.text('Hono, ' + c.env.MY_VAR))

if (import.meta.env.DEV) {
  const { apiReference } = await import('@scalar/hono-api-reference')
  app.get(
    '/openapi',
    openAPISpecs(apiRoutes, {
      documentation: {
        info: { title: 'API', version: '1.0.0', description: 'API' },
        servers: [{ url: 'http://localhost:5173/api', description: 'Local Server' }],
      },
    }),
  )

  app.get(
    '/docs',
    apiReference({
      theme: 'saturn',
      spec: { url: '/openapi' },
    }),
  )
}

app.use('/assets/*', serveStatic({ root: './build/client' }))
app.use('/favicon.ico', serveStatic({ root: './build/client' }))

app.use(async (c, next) => {
  if (import.meta.env.PROD) {
    return reactRouter({
      // @ts-expect-error it's not typed
      build: await import('virtual:react-router/server-build'),
      mode: 'production',
      getLoadContext(c) {
        return {
          var: c.var,
        } satisfies AppLoadContext
      },
    })(c, next)
  } else {
    if (!handler) {
      // @ts-expect-error it's not typed
      const build = await import('virtual:react-router/server-build')
      handler = createRequestHandler(build, 'development')
    }
    const remixContext = {
      var: c.var,
    } satisfies AppLoadContext
    return handler(c.req.raw, remixContext)
  }
})

if (import.meta.env.PROD) {
  const server = serve(
    {
      fetch: app.fetch,
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    },
    (info) => {
      console.log(`Listening on http://localhost:${info.port}`)
    },
  )
  process.on('SIGINT', () => {
    server.close(() => {
      console.log('[SIGINT] Shutting down...')
    })
  })
}

export default app
