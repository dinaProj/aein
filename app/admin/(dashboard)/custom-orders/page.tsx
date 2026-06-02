import { getCustomOrders } from '@/lib/local-db'
import { AdminCustomOrdersContent } from '@/components/admin/custom-orders-content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminCustomOrdersPage() {
  const customOrders = await getCustomOrders()

  return <AdminCustomOrdersContent customOrders={customOrders} />
}
