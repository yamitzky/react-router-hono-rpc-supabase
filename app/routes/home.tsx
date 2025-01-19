import { hc } from 'hono/client'
import { useCallback, useState } from 'react'
import type { AppType } from '../../api'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }]
}

export default function Home() {
  const client = hc<AppType>('/api')
  const [articles, setArticles] = useState<{ id: string; title: string }[]>([])
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
    <div>
      <button onClick={handleClick}>click</button>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>title: {article.title}</li>
        ))}
      </ul>
    </div>
  )
}
