import type { Context, Next } from 'hono'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export type AuthError = {
  message: string
  status?: ContentfulStatusCode
}

export interface AuthClient {
  getUser(): Promise<{ user: User; error: null } | { user: null; error: AuthError }>
}

export type User = {
  id: string
  email?: string
}

export const getAuthClient = (c: Context) => {
  return c.get('authClient')
}

declare module 'hono' {
  interface ContextVariableMap {
    authClient: AuthClient
    user: User
  }
}

export const authorized = createMiddleware(async (c, next) => {
  const authClient = getAuthClient(c)
  const { user, error } = await authClient.getUser()
  if (error) {
    throw new HTTPException(error.status ?? 401, { message: error.message })
  }
  c.set('user', user)
  await next()
})

export const authMiddleware = (createAuth: (context: Context) => AuthClient) => {
  return async (c: Context, next: Next) => {
    c.set('authClient', createAuth(c))
    await next()
  }
}
