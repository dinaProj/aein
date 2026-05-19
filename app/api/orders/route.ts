import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { addOrder } from '@/lib/local-db'
import { getCurrentCustomer } from '@/lib/customer-auth'
import type { CartItem } from '@/lib/types'

const allowedReceiptTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const maxReceiptSize = 5 * 1024 * 1024

async function saveReceipt(file: File) {
  if (!allowedReceiptTypes.includes(file.type)) {
    throw new Error('Invalid receipt file type')
  }

  if (file.size > maxReceiptSize) {
    throw new Error('Receipt file is too large')
  }

  const extension = path.extname(file.name) || '.jpg'
  const fileName = `${randomUUID()}${extension}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-receipts')
  const filePath = path.join(uploadDir, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())

  await mkdir(uploadDir, { recursive: true })
  await writeFile(filePath, buffer)

  return `/uploads/payment-receipts/${fileName}`
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer()

    if (!customer) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    const formData = await request.formData()
    const customerName = String(formData.get('customer_name') || '').trim()
    const shippingAddress = String(formData.get('shipping_address') || '').trim()
    const trackingNumber = String(formData.get('payment_tracking_number') || '').trim()
    const paymentMethod = String(formData.get('payment_method') || 'card_to_card')
    const rawItems = String(formData.get('items') || '[]')
    const receipt = formData.get('payment_receipt')

    if (paymentMethod !== 'card_to_card') {
      return NextResponse.json({ error: 'Payment gateway is disabled' }, { status: 400 })
    }

    if (!shippingAddress || !trackingNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!(receipt instanceof File) || receipt.size === 0) {
      return NextResponse.json({ error: 'Payment receipt is required' }, { status: 400 })
    }

    const items = JSON.parse(rawItems) as CartItem[]
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const totalAmount = items.reduce(
      (total, item) => total + Number(item.product?.price || 0) * Number(item.quantity || 0),
      0
    )
    const receiptUrl = await saveReceipt(receipt)
    const order = await addOrder({
      customer_id: customer.id,
      customer_name: customerName || customer.name || customer.phone,
      customer_email: customer.email,
      customer_phone: customer.phone,
      shipping_address: shippingAddress,
      items,
      total_amount: totalAmount,
      payment_method: 'card_to_card',
      payment_receipt_url: receiptUrl,
      payment_tracking_number: trackingNumber,
    })

    return NextResponse.json({ orderId: order.id, success: true })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
