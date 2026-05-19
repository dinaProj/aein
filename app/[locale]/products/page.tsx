import { getCategories, getProducts } from '@/lib/local-db'
import { ProductsContent } from '@/components/products-content'
import type { Locale } from '@/lib/types'

interface PageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { category } = await searchParams
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <ProductsContent
      locale={locale}
      products={products}
      categories={categories}
      initialCategory={category}
    />
  )
}
