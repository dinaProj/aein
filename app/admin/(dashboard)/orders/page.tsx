import { getOrders } from '@/lib/local-db'
import { AdminOrdersContent } from '@/components/admin/orders-content'

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return <AdminOrdersContent orders={orders} />
}
