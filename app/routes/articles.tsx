import { Button } from '@heroui/button'
import { hc } from 'hono/client'
import { Suspense, use, useCallback, useEffect, useState, useTransition } from 'react'
import { redirect, useLoaderData } from 'react-router'
import type { AppType } from '~/api'
import { ArticleCard } from '~/components/ArticleCard'
import type { Article } from '~/models/article'
import type { Route } from './+types/articles'

export function meta() {
  return [{ title: 'Articles' }, { name: 'description', content: 'Articles page' }]
}

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

  const articlesPromise = context.var.repositories.articleRepository.findAll({ limit: 1 })
  return { articlesPromise }
}

async function fetchArticles(offset: number) {
  const client = hc<AppType>('/api')
  const response = await client.articles.$get({ query: { offset: String(offset) } })
  if (!response.ok) {
    throw new Error(await response.text())
  } else {
    const data = await response.json()
    return data.articles
  }
}

export default function ArticlesRoute() {
  const { articlesPromise: initialArticlesPromise } = useLoaderData<typeof loader>()
  const [pages, setPages] = useState<{ promise: Promise<Article[]>; offset: number; count?: number }[]>([
    {
      promise: initialArticlesPromise,
      offset: 0,
    },
  ])
  const [isLoading, startTransition] = useTransition()

  const handleLoadMore = useCallback(() => {
    startTransition(() => {
      setPages((prev) => {
        const lastPage = prev[prev.length - 1]
        if (lastPage?.count == null) {
          return prev
        }
        return [
          ...prev,
          {
            offset: lastPage.offset + lastPage.count,
            promise: fetchArticles(lastPage.offset + lastPage.count),
          },
        ]
      })
    })
  }, [])

  const handleOnLoad = useCallback((page: number, count: number) => {
    setPages((prev) => {
      prev[page] = { ...prev[page], count }
      return prev
    })
  }, [])

  return (
    <div className="p-8 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map(({ promise }, page) => (
          <Suspense fallback={page === 0 ? <ArticleCard /> : undefined} key={page}>
            <ArticlesPage onLoad={(count) => handleOnLoad(page, count)} articlesPromise={promise} />
          </Suspense>
        ))}
        <Button isLoading={isLoading} onPress={handleLoadMore} className="font-medium px-6">
          {isLoading ? 'Loading...' : 'Load more'}
        </Button>
      </div>
    </div>
  )
}

function ArticlesPage({
  articlesPromise,
  onLoad,
}: { articlesPromise: Promise<Article[]>; onLoad: (count: number) => void }) {
  const articles = use(articlesPromise)
  useEffect(() => {
    onLoad(articles.length)
  }, [articles])

  return (
    <>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </>
  )
}
