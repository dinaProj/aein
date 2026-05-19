import Link from 'next/link'
import { Instagram, Twitter } from 'lucide-react'
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
                : 'AEIN SHOP Art Store - A collection of canvas art, designer t-shirts, and artistic posters'}
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
                <Link
                  href={`/${locale}/custom-order`}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {dict.common.customOrder}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">{dict.common.followUs}</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {dict.common.shopName}. {dict.common.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  )
}
