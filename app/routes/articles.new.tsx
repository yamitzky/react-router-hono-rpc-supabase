import { Button } from '@heroui/button'
import { Input, Textarea } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { hc } from 'hono/client'
import { useState } from 'react'
import { redirect, useNavigate } from 'react-router'
import type { AppType } from '~/api'
import type { Route } from './+types/articles.new'

export async function loader({ context }: Route.LoaderArgs) {
  const result = await context.var.authClient.getUser()
  if (!result) {
    throw new Response('Unknown error', { status: 500 })
  }
  if (!result || result.error) {
    if (result.error.status === 401) {
      return redirect('/login')
    }
    throw new Response(result.error.message, { status: result.error.status })
  }
}

export default function NewArticle() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const client = hc<AppType>('/api')
    const response = await client.articles.$post({
      json: {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        visibility: formData.get('visibility') as 'public' | 'private',
      },
    })
    if (!response.ok) {
      setError(await response.text())
    } else {
      navigate('/articles')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Article</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input isRequired label="Title" id="title" name="title" required className="w-full" />
        <Textarea label="Content" id="content" name="content" className="w-full min-h-[200px]" />

        <Select
          label="Visibility"
          id="visibility"
          name="visibility"
          defaultSelectedKeys={['private']}
          isRequired
          className="w-full"
        >
          <SelectItem key="private" value="private">
            Private
          </SelectItem>
          <SelectItem key="public" value="public">
            Public
          </SelectItem>
        </Select>

        <p className="text-center text-sm text-danger">{error}</p>

        <Button type="submit" color="primary" isLoading={isSubmitting}>
          Save
        </Button>
      </form>
    </div>
  )
}
