import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { setCookie } from 'hono/cookie'

type SupabaseEnv = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export function createSupabaseFromContext(c: Context) {
  const supabaseEnv = env<SupabaseEnv>(c)
  const supabaseUrl = supabaseEnv.SUPABASE_URL
  const supabaseAnonKey = supabaseEnv.SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL missing!')
  }

  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY missing!')
  }
  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
}
