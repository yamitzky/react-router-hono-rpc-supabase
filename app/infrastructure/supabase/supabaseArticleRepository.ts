import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from 'hono'
import { createSupabaseFromContext } from '~/infrastructure/supabase/common'
import type { Article } from '../../models/article'
import type { Database } from './database.types'

export class SupabaseArticleRepository {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async findById(id: string): Promise<Article | undefined> {
    const { data } = await this.supabase
      .from('articles')
      .select('id, title, content, authorId:author_id, createdAt:created_at, visibility')
      .eq('id', id)
      .single()

    return data ?? undefined
  }

  async findAll(params?: {
    limit?: number
    offset?: number
  }): Promise<Article[]> {
    let select = this.supabase
      .from('articles')
      .select('id, title, content, authorId:author_id, createdAt:created_at, visibility')
      .order('created_at', { ascending: false })

    if (params?.limit) {
      select = select.limit(params.limit)
    }
    if (params?.offset && params.limit) {
      select = select.range(params.offset, params.offset + params.limit)
    } else if (params?.offset) {
      throw new Error('Invalid parameters')
    }

    const { data } = await select
    return data ?? []
  }

  async create(articleData: Omit<Article, 'id'>): Promise<Article> {
    const { data, error } = await this.supabase
      .from('articles')
      .insert({
        title: articleData.title,
        content: articleData.content,
        author_id: articleData.authorId,
        visibility: articleData.visibility,
      })
      .select('id, title, content, authorId:author_id, createdAt:created_at, visibility')
      .single()

    if (error) {
      throw error
    }
    if (!data) {
      throw new Error('Failed to create article')
    }

    return data
  }

  async update(id: string, articleData: Partial<Article>): Promise<Article> {
    const { data, error } = await this.supabase
      .from('articles')
      .update({
        title: articleData.title,
        content: articleData.content,
        author_id: articleData.authorId,
        visibility: articleData.visibility,
      })
      .eq('id', id)
      .select('id, title, content, authorId:author_id, createdAt:created_at, visibility')
      .single()

    if (error) {
      throw error
    }
    if (!data) {
      throw new Error('Article not found')
    }

    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('articles').delete().eq('id', id)

    if (error) {
      throw error
    }
  }

  static fromContext(c: Context) {
    const supabase = createSupabaseFromContext(c)
    return new SupabaseArticleRepository(supabase)
  }
}
