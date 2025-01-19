import { Hono } from 'hono'
import { articleRoutes } from './articles'

const apiRoutes = new Hono().route('/articles', articleRoutes)

export type AppType = typeof apiRoutes
export default apiRoutes
