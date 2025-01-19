import { articleRoutes } from 'api/articles'
import { Hono } from 'hono'

const apiRoutes = new Hono().route('/articles', articleRoutes)

export type AppType = typeof apiRoutes
export default apiRoutes
