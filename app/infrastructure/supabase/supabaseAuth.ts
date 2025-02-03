import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from 'hono'
import type { AuthError } from '~/middleware/authMiddleware'
import { createSupabaseFromContext } from './common'

export class SupabaseAuth {
  supabase: SupabaseClient
  jwt?: string

  constructor(supabase: SupabaseClient, jwt?: string) {
    this.supabase = supabase
    this.jwt = jwt
  }

  async getUser() {
    if (!this.jwt) {
      const sessionResult = await this.supabase.auth.getSession()
      if (sessionResult.error) {
        return { user: null, error: sessionResult.error as AuthError }
      }
      if (!sessionResult.data.session) {
        return { user: null, error: { message: 'Unauthorized', status: 401 as const } }
      }
    }

    const { data, error } = await this.supabase.auth.getUser(this.jwt)
    if (error) {
      console.log(error)
      return { user: null, error: error as AuthError }
    }
    return { user: data.user, error: null }
  }

  static fromContext(c: Context) {
    const supabase = createSupabaseFromContext(c)
    const jwt = parseBearerToken(c.req.header('Authorization') ?? '')
    return new SupabaseAuth(supabase, jwt)
  }
}

function parseBearerToken(token: string) {
  const parts = token.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
}
