import { CustomOrderContent } from '@/components/custom-order-content'
import type { Locale } from '@/lib/types'

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function CustomOrderPage({ params }: PageProps) {
  const { locale } = await params
  return <CustomOrderContent locale={locale} />
}
