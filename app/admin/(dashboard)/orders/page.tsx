import { getOrders } from '@/lib/local-db'
import { AdminOrdersContent } from '@/components/admin/orders-content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return <AdminOrdersContent orders={orders} />
}
