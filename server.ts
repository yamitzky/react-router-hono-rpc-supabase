import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import type { AppLoadContext, RequestHandler } from 'react-router'
import { createRequestHandler } from 'react-router'
import { reactRouter } from 'remix-hono/handler'
import apiRoutes from './api'

const app = new Hono<{
  Bindings: {
    MY_VAR: string
  }
}>()

let handler: RequestHandler | undefined

app.route('/api', apiRoutes)
app.get('/hono', (c) => c.text('Hono, ' + c.env.MY_VAR))

if (import.meta.env.PROD) {
  app.use('/assets/*', serveStatic({ root: './build/client' }))
  app.use('/favicon.ico', serveStatic({ root: './build/client' }))
}

app.use(async (c, next) => {
  if (process.env.NODE_ENV !== 'development' || import.meta.env.PROD) {
    // @ts-expect-error it's not typed
    const serverBuild = await import('./build/server')
    return reactRouter({
      build: serverBuild,
      mode: 'production',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      getLoadContext(c) {
        return {
          cloudflare: {
            env: c.env,
          },
        }
      },
    })(c, next)
  } else {
    if (!handler) {
      // @ts-expect-error it's not typed
      const build = await import('virtual:react-router/server-build')
      handler = createRequestHandler(build, 'development')
    }
    const remixContext = {
      cloudflare: {
        env: c.env,
      },
    } as unknown as AppLoadContext
    return handler(c.req.raw, remixContext)
  }
})

export default app
