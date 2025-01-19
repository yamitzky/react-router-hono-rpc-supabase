import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import type { AppLoadContext, RequestHandler } from 'react-router'
import { createRequestHandler } from 'react-router'
import { reactRouter } from 'remix-hono/handler'

const app = new Hono<{
  Bindings: {
    MY_VAR: string
  }
}>()

let handler: RequestHandler | undefined

app.use(poweredBy())
app.get('/hono', (c) => c.text('Hono, ' + c.env.MY_VAR))

app.use(async (c, next) => {
  if (process.env.NODE_ENV !== 'development' || import.meta.env.PROD) {
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
