import Link from 'next/link'
import { Instagram, Send } from 'lucide-react'
import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/types'

interface FooterProps {
  locale: Locale
}

export function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">
              {dict.common.shopName}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {locale === 'fa'
                ? 'فروشگاه هنری آیین شاپ - مجموعه‌ای از تی‌شرت‌های طراحی شده و پوسترهای امروزی'
                : 'AEIN SHOP Art Store - A collection of mugs, designer t-shirts, and artistic posters'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{locale === 'fa' ? 'لینک‌های سریع' : 'Quick Links'}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {dict.common.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/products`}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {dict.common.products}
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/60 text-sm cursor-not-allowed">
                  {dict.common.customOrder}
                  <span className="ms-2 text-xs">
                    {locale === 'fa' ? 'فعلا غیرفعال' : 'Disabled'}
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">{dict.common.followUs}</h4>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://instagram.com/aein.shopp"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://t.me/AeinShopp"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {dict.common.shopName}. {dict.common.allRightsReserved}
          </p>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://trustseal.enamad.ir/?id=6204012&Code=A8TiSxBkV7Q6AJhY0GR63qngXNLGrnC1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              referrerPolicy="origin"
              src="/enamad-logo.png"
              alt="نماد اعتماد الکترونیکی"
              data-code="A8TiSxBkV7Q6AJhY0GR63qngXNLGrnC1"
              className="mx-auto h-16 w-auto"
              style={{ cursor: 'pointer' }}
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
