import { getProductById } from '@/lib/local-db'
import { ProductDetailContent } from '@/components/product-detail-content'
import { notFound } from 'next/navigation'
import type { Locale } from '@/lib/types'

interface PageProps {
  params: Promise<{ locale: Locale; id: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return <ProductDetailContent locale={locale} product={product} />
}
