import { getCustomOrders } from '@/lib/local-db'
import { AdminCustomOrdersContent } from '@/components/admin/custom-orders-content'

export default async function AdminCustomOrdersPage() {
  const customOrders = await getCustomOrders()

  return <AdminCustomOrdersContent customOrders={customOrders} />
}
