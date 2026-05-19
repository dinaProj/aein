import { NextRequest, NextResponse } from 'next/server'
import { addCustomOrder } from '@/lib/local-db'

export async function POST(request: NextRequest) {
  const order = await request.json()
  await addCustomOrder(order)

  return NextResponse.json({ success: true })
}
