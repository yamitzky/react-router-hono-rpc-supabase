import { Card, CardBody, CardHeader } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Skeleton } from '@heroui/skeleton'
import type { Article } from '~/models/article'

export function ArticleCard({ article }: { article?: Article }) {
  const isLoaded = !!article
  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex gap-3 border-b px-6 py-4">
        <Skeleton isLoaded={isLoaded}>
          <Chip className="text-xs" color="primary" variant="flat">
            ID: {article?.id}
          </Chip>
        </Skeleton>
      </CardHeader>
      <CardBody className="px-6 py-4">
        <Skeleton isLoaded={isLoaded}>
          <h4 className="text-xl font-semibold mb-2">{article?.title ?? 'loading'}</h4>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <p className="text-sm leading-relaxed">{article?.content ?? 'loading'}</p>
        </Skeleton>
      </CardBody>
    </Card>
  )
}
