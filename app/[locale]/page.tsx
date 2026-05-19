import { getCategories, getFeaturedProducts } from '@/lib/local-db'
import { HomeContent } from '@/components/home-content'
import type { Locale } from '@/lib/types'

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ])

  return (
    <HomeContent
      locale={locale}
      featuredProducts={featuredProducts}
      categories={categories}
    />
  )
}
