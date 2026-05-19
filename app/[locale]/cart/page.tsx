import { CartContent } from '@/components/cart-content'
import type { Locale } from '@/lib/types'

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function CartPage({ params }: PageProps) {
  const { locale } = await params
  return <CartContent locale={locale} />
}
