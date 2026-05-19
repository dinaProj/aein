import { getCategories, getProducts } from '@/lib/local-db'
import { AdminProductsContent } from '@/components/admin/products-content'

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <AdminProductsContent
      products={products}
      categories={categories}
    />
  )
}
