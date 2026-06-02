import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import { getCustomerById } from './local-db'

export const CUSTOMER_SESSION_COOKIE = 'customer_session'

const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

function normalizeDigits(value: string) {
  return value
    .replace(/\s+/g, '')
    .split('')
    .map((char) => {
      const persianIndex = persianDigits.indexOf(char)
      if (persianIndex !== -1) return String(persianIndex)

      const arabicIndex = arabicDigits.indexOf(char)
      if (arabicIndex !== -1) return String(arabicIndex)

      return char
    })
    .join('')
}

export function normalizePhone(phone: string) {
  let normalized = normalizeDigits(phone.trim())
  normalized = normalized.replace(/^\+98/, '0')
  normalized = normalized.replace(/^0098/, '0')
  normalized = normalized.replace(/^98/, '0')
  normalized = normalized.replace(/[^0-9]/g, '')
  return normalized
}

export function normalizeVerificationCode(code: string) {
  return normalizeDigits(code.trim())
}

export function hashCustomerPassword(password: string) {
  return createHash('sha256').update(password).digest('hex')
}

export function hashVerificationCode(phone: string, code: string) {
  return createHash('sha256').update(`${phone}:${normalizeVerificationCode(code)}`).digest('hex')
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies()
  const customerId = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value

  if (!customerId) {
    return null
  }

  return getCustomerById(customerId)
}
