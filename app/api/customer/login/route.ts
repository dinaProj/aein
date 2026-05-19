import { NextRequest, NextResponse } from 'next/server'
import { getCustomerByPhone } from '@/lib/local-db'
import {
  CUSTOMER_SESSION_COOKIE,
  hashCustomerPassword,
  normalizePhone,
} from '@/lib/customer-auth'

export async function POST(request: NextRequest) {
  const { phone, password } = (await request.json()) as {
    phone?: string
    password?: string
  }

  const normalizedPhone = normalizePhone(phone || '')

  if (!normalizedPhone || !password) {
    return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 })
  }

  const customer = await getCustomerByPhone(normalizedPhone)

  if (!customer?.password_hash || customer.password_hash !== hashCustomerPassword(password)) {
    return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true, customer })
  response.cookies.set(CUSTOMER_SESSION_COOKIE, customer.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return response
}
