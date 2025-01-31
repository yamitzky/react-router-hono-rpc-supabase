import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { setCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

type AuthError = {
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

// FIXME: It's better to separate `authMiddleware` and the specific implementation of Supabase.
type SupabaseEnv = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}
class SupabaseAuth implements AuthClient {
  supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async getUser() {
    const sessionResult = await this.supabase.auth.getSession()
    if (sessionResult.error) {
      return { user: null, error: sessionResult.error as AuthError }
    }
    if (!sessionResult.data.session) {
      return { user: null, error: { message: 'Unauthorized', status: 401 as const } }
    }

    const { data, error } = await this.supabase.auth.getUser()
    if (error) {
      console.log(error)
      return { user: null, error: error as AuthError }
    }
    return { user: data.user, error: null }
  }
}

export const authClientMiddleware = createMiddleware(async (c, next) => {
  const supabaseEnv = env<SupabaseEnv>(c)
  const supabaseUrl = supabaseEnv.SUPABASE_URL
  const supabaseAnonKey = supabaseEnv.SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL missing!')
  }

  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY missing!')
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(c.req.header('Cookie') ?? '')
      },
      setAll(cookiesToSet) {
        // @ts-expect-error Copied official sample, but the types of cookie are slightly mismatched.
        cookiesToSet.forEach(({ name, value, options }) => setCookie(c, name, value, options))
      },
    },
  })

  c.set('authClient', new SupabaseAuth(supabase))

  await next()
})
