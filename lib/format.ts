import type { Locale } from './types'

export function formatRial(amount: number, locale: Locale | 'admin' = 'fa') {
  const numberLocale = locale === 'en' ? 'en-US' : 'fa-IR'

  return new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency: 'IRR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}
