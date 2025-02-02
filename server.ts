import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { type ContextVariableMap, Hono } from 'hono'
import { openAPISpecs } from 'hono-openapi'
import process from 'node:process'
import type { AppLoadContext, RequestHandler } from 'react-router'
import { createRequestHandler } from 'react-router'
import { reactRouter } from 'remix-hono/handler'
import { authClientMiddleware } from '~/middleware/authMiddleware'
import apiRoutes from './app/api'
import { InMemoryArticleRepository } from './app/infrastructure/memory/inMemoryArticleRepository'
import { repositoryMiddleware } from './app/middleware/repositoryMiddleware'

declare module 'react-router' {
  interface AppLoadContext {
    var: ContextVariableMap
  }
}

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
app.use(repositoryMiddleware(repositories))

app.use('*', authClientMiddleware)

app.route('/api', apiRoutes)
app.get('/hono', (c) => c.text('Hono, ' + c.env.MY_VAR))

if (import.meta.env.DEV) {
  const { apiReference } = await import('@scalar/hono-api-reference')
  app.get(
    '/openapi',
    openAPISpecs(apiRoutes, {
      documentation: {
        info: {
          title: 'API',
          version: '1.0.0',
          description: `# Python Instruction

\`\`\`python
import os
import requests
from supabase import create_client

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_ANON_KEY"]
supabase = supabase.create_client(url, key)

# Email Sign In with OTP
supabase.auth.sign_in_with_otp({
    "email": "your-email-address@example.com",
    "options": {
      "should_create_user": False,
    },
})
auth = supabase.auth.verify_otp({
    "email": "your-email-address@example.com",
    "token": "123456",  # OTP code you received
    "type": "email"
})

auth_header = f"Bearer {auth.session.access_token}"
response = requests.get("http://localhost:5173/api/articles", headers={"Authorization": auth_header})
print(response.json())
\`\`\`
          
          `,
        },
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
