'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X, Globe, UserRound } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getDictionary, getDirection } from '@/lib/dictionaries'
import { useCartStore } from '@/lib/store'
import type { Locale } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  locale: Locale
}

export function Header({ locale }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dict = getDictionary(locale)
  const dir = getDirection(locale)
  const cartItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const switchLocale = () => {
    const newLocale = locale === 'fa' ? 'en' : 'fa'
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
    router.push(newPathname)
  }

  const navItems = [
    { href: `/${locale}`, label: dict.common.home },
    { href: `/${locale}/products`, label: dict.common.products },
    { href: `/${locale}/custom-order`, label: dict.common.customOrder },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <motion.span
              initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl md:text-2xl font-bold text-primary"
            >
              {dict.common.shopName}
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={switchLocale}
              className="hidden md:flex"
            >
              <Globe className="h-5 w-5" />
              <span className="sr-only">{dict.common.language}</span>
            </Button>

            <Link href={`/${locale}/account`}>
              <Button variant="ghost" size="icon">
                <UserRound className="h-5 w-5" />
                <span className="sr-only">
                  {locale === 'fa' ? 'پنل کاربری' : 'Account'}
                </span>
              </Button>
            </Link>

            <Link href={`/${locale}/cart`}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartItems}
                  </motion.span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'block py-2 px-4 rounded-lg transition-colors',
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href={`/${locale}/account`}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'block py-2 px-4 rounded-lg transition-colors',
                    pathname === `/${locale}/account`
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary'
                  )}
                >
                  {locale === 'fa' ? 'پنل کاربری' : 'Account'}
                </Link>
                <button
                  onClick={() => {
                    switchLocale()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-2 w-full py-2 px-4 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>{locale === 'fa' ? 'English' : 'فارسی'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
