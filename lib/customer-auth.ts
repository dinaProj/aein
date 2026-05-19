import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import { getCustomerById } from './local-db'

export const CUSTOMER_SESSION_COOKIE = 'customer_session'

export function normalizePhone(phone: string) {
  return phone.trim().replace(/\s+/g, '')
}

export function hashCustomerPassword(password: string) {
  return createHash('sha256').update(password).digest('hex')
}

export function hashVerificationCode(phone: string, code: string) {
  return createHash('sha256').update(`${phone}:${code}`).digest('hex')
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies()
  const customerId = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value

  if (!customerId) {
    return null
  }

  return getCustomerById(customerId)
}
