import * as v from 'valibot'

export const ArticleSchema = v.object({
  id: v.string(),
  title: v.string(),
  content: v.nullable(v.string()),
  authorId: v.string(),
  createdAt: v.string(),
  visibility: v.union([v.literal('public'), v.literal('private')]),
})
export type Article = v.InferOutput<typeof ArticleSchema>
