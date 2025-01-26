import { Button } from '@heroui/button'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table'
import type { ContextVariableMap } from 'hono'
import { hc } from 'hono/client'
import { useCallback, useState } from 'react'
import { type LoaderFunctionArgs, useLoaderData } from 'react-router'
import type { AppType } from '../api'

export function meta() {
  return [{ title: 'Articles' }, { name: 'description', content: 'Articles page' }]
}

export async function loader({ context }: LoaderFunctionArgs<{ var: ContextVariableMap }>) {
  const articles = await context?.var.repositories.articleRepository.findAll()
  return { articles: articles?.slice(0, 1) ?? [] }
}

export default function Articles() {
  const client = hc<AppType>('/api')
  const { articles: initialArticles } = useLoaderData<typeof loader>()
  const [articles, setArticles] = useState<{ id: string; title: string }[]>(initialArticles)
  const handleClick = useCallback(async () => {
    const response = await client.articles.$get()
    if (!response.ok) {
      alert(response.statusText)
    } else {
      const data = await response.json()
      setArticles(data.articles)
    }
  }, [])
  return (
    <div className="p-4">
      <div className="mb-4">
        <Button onPress={handleClick}>Fetch Articles</Button>
      </div>
      <Table aria-label="Articles List">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Title</TableColumn>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>{article.id}</TableCell>
              <TableCell>{article.title}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
