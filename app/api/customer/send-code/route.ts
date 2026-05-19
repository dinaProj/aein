import { NextRequest, NextResponse } from 'next/server'
import { getCustomerByPhone, saveCustomerOtp } from '@/lib/local-db'
import { hashVerificationCode, normalizePhone } from '@/lib/customer-auth'
import { sendSmsIrVerifyCode } from '@/lib/sms-ir'

function createCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = (await request.json()) as { phone?: string }
    const normalizedPhone = normalizePhone(phone || '')

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const existingCustomer = await getCustomerByPhone(normalizedPhone)
    if (existingCustomer?.password_hash) {
      return NextResponse.json({ error: 'This phone is already registered' }, { status: 409 })
    }

    const code = createCode()
    await saveCustomerOtp({
      phone: normalizedPhone,
      code_hash: hashVerificationCode(normalizedPhone, code),
      expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    })

    const smsResult = await sendSmsIrVerifyCode(normalizedPhone, code)

    return NextResponse.json({
      success: true,
      devCode: 'skipped' in smsResult ? code : undefined,
    })
  } catch (error) {
    console.error('Send verification code error:', error)
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
  }
}
