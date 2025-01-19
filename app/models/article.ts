import * as v from 'valibot'

export const ArticleSchema = v.object({
  id: v.string(),
  title: v.string(),
  content: v.string(),
  authorId: v.string(),
  createdAt: v.string(),
})
export type Article = v.InferOutput<typeof ArticleSchema>
