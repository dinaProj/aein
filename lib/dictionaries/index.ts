import { fa } from './fa'
import { en } from './en'
import type { Locale, Dictionary } from '../types'

const dictionaries: Record<Locale, Dictionary> = { fa, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.fa
}

export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'fa' ? 'rtl' : 'ltr'
}
