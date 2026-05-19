import { randomUUID } from 'crypto'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { Category, CustomerAccount, CustomerOtp, CustomOrder, Order, Product } from './types'

interface LocalDatabase {
  categories: Category[]
  products: Product[]
  orders: Order[]
  customOrders: CustomOrder[]
  customers?: CustomerAccount[]
  customerOtps?: CustomerOtp[]
}

type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>
type ProductUpdate = Partial<ProductInput>
type OrderInput = Omit<Order, 'id' | 'created_at' | 'status' | 'payment_status'>
type CustomerAccountInput = Omit<CustomerAccount, 'id' | 'created_at'>
type CustomerOtpInput = Omit<CustomerOtp, 'created_at' | 'attempts'>

const dbPath = path.join(process.cwd(), 'data', 'db.json')

async function readDb(): Promise<LocalDatabase> {
  const raw = await readFile(dbPath, 'utf8')
  const db = JSON.parse(raw) as LocalDatabase
  return { ...db, customers: db.customers || [], customerOtps: db.customerOtps || [] }
}

async function writeDb(db: LocalDatabase) {
  await mkdir(path.dirname(dbPath), { recursive: true })
  await writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8')
}

function withCategory(product: Product, categories: Category[]): Product {
  return {
    ...product,
    category: categories.find((category) => category.id === product.category_id),
  }
}

export async function getCategories() {
  const db = await readDb()
  return [...db.categories].sort((a, b) => a.name_en.localeCompare(b.name_en))
}

export async function getProducts() {
  const db = await readDb()
  return [...db.products]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((product) => withCategory(product, db.categories))
}

export async function getFeaturedProducts(limit = 8) {
  const products = await getProducts()
  return products.filter((product) => product.is_featured).slice(0, limit)
}

export async function getProductById(id: string) {
  const db = await readDb()
  const product = db.products.find((item) => item.id === id)
  return product ? withCategory(product, db.categories) : null
}

export async function saveProduct(input: ProductInput, id?: string) {
  const db = await readDb()
  const now = new Date().toISOString()

  if (id) {
    db.products = db.products.map((product) =>
      product.id === id
        ? { ...product, ...input, updated_at: now }
        : product
    )
  } else {
    db.products.unshift({
      ...input,
      id: randomUUID(),
      created_at: now,
      updated_at: now,
    })
  }

  await writeDb(db)
}

export async function updateProduct(id: string, input: ProductUpdate) {
  const db = await readDb()
  const now = new Date().toISOString()
  db.products = db.products.map((product) =>
    product.id === id ? { ...product, ...input, updated_at: now } : product
  )
  await writeDb(db)
}

export async function deleteProduct(id: string) {
  const db = await readDb()
  db.products = db.products.filter((product) => product.id !== id)
  await writeDb(db)
}

export async function getOrders() {
  const db = await readDb()
  return [...db.orders].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function getOrdersByCustomerId(customerId: string) {
  const db = await readDb()
  return [...db.orders]
    .filter((order) => order.customer_id === customerId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function getCustomerById(id: string) {
  const db = await readDb()
  return db.customers?.find((customer) => customer.id === id) || null
}

export async function getCustomerByPhone(phone: string) {
  const db = await readDb()
  return db.customers?.find((customer) => customer.phone === phone) || null
}

export async function createCustomerAccount(input: CustomerAccountInput) {
  const db = await readDb()
  const now = new Date().toISOString()
  const existing = db.customers?.find((customer) => customer.phone === input.phone)

  if (existing) {
    return existing
  }

  const customer = {
    ...input,
    id: randomUUID(),
    created_at: now,
  }

  db.customers = [customer, ...(db.customers || [])]
  await writeDb(db)
  return customer
}

export async function updateCustomerPassword(phone: string, passwordHash: string) {
  const db = await readDb()
  let updatedCustomer: CustomerAccount | null = null

  db.customers = (db.customers || []).map((customer) => {
    if (customer.phone !== phone) {
      return customer
    }

    updatedCustomer = { ...customer, password_hash: passwordHash }
    return updatedCustomer
  })

  await writeDb(db)
  return updatedCustomer
}

export async function saveCustomerOtp(input: CustomerOtpInput) {
  const db = await readDb()
  db.customerOtps = [
    {
      ...input,
      attempts: 0,
      created_at: new Date().toISOString(),
    },
    ...(db.customerOtps || []).filter((otp) => otp.phone !== input.phone),
  ]
  await writeDb(db)
}

export async function getCustomerOtp(phone: string) {
  const db = await readDb()
  return db.customerOtps?.find((otp) => otp.phone === phone) || null
}

export async function incrementCustomerOtpAttempts(phone: string) {
  const db = await readDb()
  db.customerOtps = (db.customerOtps || []).map((otp) =>
    otp.phone === phone ? { ...otp, attempts: otp.attempts + 1 } : otp
  )
  await writeDb(db)
}

export async function deleteCustomerOtp(phone: string) {
  const db = await readDb()
  db.customerOtps = (db.customerOtps || []).filter((otp) => otp.phone !== phone)
  await writeDb(db)
}

export async function addOrder(input: OrderInput) {
  const db = await readDb()
  const order: Order = {
    ...input,
    id: randomUUID(),
    status: 'pending',
    payment_status: 'awaiting_admin_review',
    created_at: new Date().toISOString(),
  }

  db.orders.unshift(order)
  await writeDb(db)
  return order
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  const db = await readDb()
  db.orders = db.orders.map((order) =>
    order.id === id
      ? {
          ...order,
          status,
          payment_status:
            status === 'processing' && order.payment_status === 'awaiting_admin_review'
              ? 'approved'
              : status === 'cancelled' && order.payment_status === 'awaiting_admin_review'
                ? 'rejected'
              : order.payment_status,
        }
      : order
  )
  await writeDb(db)
}

export async function getCustomOrders() {
  const db = await readDb()
  return [...db.customOrders].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function addCustomOrder(
  input: Pick<CustomOrder, 'name' | 'email' | 'phone' | 'product_type' | 'description'>
) {
  const db = await readDb()
  db.customOrders.unshift({
    ...input,
    id: randomUUID(),
    file_url: null,
    status: 'pending',
    admin_notes: null,
    created_at: new Date().toISOString(),
  })
  await writeDb(db)
}

export async function updateCustomOrderStatus(
  id: string,
  status: CustomOrder['status']
) {
  const db = await readDb()
  db.customOrders = db.customOrders.map((order) =>
    order.id === id ? { ...order, status } : order
  )
  await writeDb(db)
}
