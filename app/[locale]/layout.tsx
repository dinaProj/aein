import type { Locale } from '@/lib/types'
import { getDirection } from '@/lib/dictionaries'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export function generateStaticParams() {
  return [{ locale: 'fa' }, { locale: 'en' }]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = (rawLocale === 'en' ? 'en' : 'fa') satisfies Locale
  const dir = getDirection(locale)

  return (
    <div dir={dir} lang={locale} className="min-h-screen flex flex-col">
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  )
}
