import { Hono } from 'hono'

export const articleRoutes = new Hono().get('/', async (c) => {
  const titles = [
    'Breaking News: AI Takes Over Coffee Making',
    'The Secret Life of Code Comments',
    'Why Developers Love Pizza: A Scientific Study',
    'Top 10 Keyboard Shortcuts You Never Knew Existed',
    'The Art of Debugging: A Love Story',
  ]

  const randomId = crypto.randomUUID()
  const randomTitle = titles[Math.floor(Math.random() * titles.length)]

  return c.json({
    articles: [
      {
        id: randomId,
        title: randomTitle,
      },
    ],
  })
})
