import { AccountContent } from '@/components/account-content'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { getOrdersByCustomerId } from '@/lib/local-db'
import type { Locale } from '@/lib/types'

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ redirect?: string }>
}) {
  const { locale: rawLocale } = await params
  const { redirect } = await searchParams
  const locale = (rawLocale === 'en' ? 'en' : 'fa') satisfies Locale
  const customer = await getCurrentCustomer()
  const orders = customer ? await getOrdersByCustomerId(customer.id) : []

  return (
    <AccountContent
      locale={locale}
      customer={customer}
      orders={orders}
      redirectTo={redirect}
    />
  )
}
