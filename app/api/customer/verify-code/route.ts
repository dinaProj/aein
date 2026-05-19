import { NextRequest, NextResponse } from 'next/server'
import {
  createCustomerAccount,
  deleteCustomerOtp,
  getCustomerByPhone,
  getCustomerOtp,
  incrementCustomerOtpAttempts,
  updateCustomerPassword,
} from '@/lib/local-db'
import {
  CUSTOMER_SESSION_COOKIE,
  hashCustomerPassword,
  hashVerificationCode,
  normalizePhone,
} from '@/lib/customer-auth'

export async function POST(request: NextRequest) {
  const { phone, code, password } = (await request.json()) as {
    phone?: string
    code?: string
    password?: string
  }

  const normalizedPhone = normalizePhone(phone || '')
  const normalizedCode = String(code || '').trim()
  const accountPassword = String(password || '')
  const otp = await getCustomerOtp(normalizedPhone)

  if (accountPassword.length < 6) {
    return NextResponse.json({ error: 'Password is too short' }, { status: 400 })
  }

  if (!otp) {
    return NextResponse.json({ error: 'Code not found' }, { status: 400 })
  }

  if (new Date(otp.expires_at).getTime() < Date.now()) {
    await deleteCustomerOtp(normalizedPhone)
    return NextResponse.json({ error: 'Code expired' }, { status: 400 })
  }

  if (otp.attempts >= 5) {
    await deleteCustomerOtp(normalizedPhone)
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  }

  if (otp.code_hash !== hashVerificationCode(normalizedPhone, normalizedCode)) {
    await incrementCustomerOtpAttempts(normalizedPhone)
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  const existingCustomer = await getCustomerByPhone(normalizedPhone)
  let customer = existingCustomer

  if (existingCustomer?.password_hash) {
    await deleteCustomerOtp(normalizedPhone)
    return NextResponse.json({ error: 'This phone is already registered' }, { status: 409 })
  }

  if (existingCustomer) {
    customer = await updateCustomerPassword(
      normalizedPhone,
      hashCustomerPassword(accountPassword)
    )
  } else {
    customer = await createCustomerAccount({
      name: null,
      email: null,
      phone: normalizedPhone,
      password_hash: hashCustomerPassword(accountPassword),
    })
  }

  await deleteCustomerOtp(normalizedPhone)

  const response = NextResponse.json({ success: true, customer })
  response.cookies.set(CUSTOMER_SESSION_COOKIE, customer!.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return response
}
