'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Palette, ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDictionary, getDirection } from '@/lib/dictionaries'
import type { Locale, Product, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'

interface HomeContentProps {
  locale: Locale
  featuredProducts: Product[]
  categories: Category[]
}

export function HomeContent({ locale, featuredProducts, categories }: HomeContentProps) {
  const dict = getDictionary(locale)
  const dir = getDirection(locale)
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance"
            >
              {dict.home.heroTitle}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty"
            >
              {dict.home.heroSubtitle}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href={`/${locale}/products`}>
                <Button size="lg" className="gap-2 text-base px-8">
                  <ShoppingBag className="h-5 w-5" />
                  {dict.home.shopNow}
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2 text-base px-8" disabled>
                <Palette className="h-5 w-5" />
                {locale === 'fa' ? 'سفارش طرح دلخواه فعلا غیرفعال است' : 'Custom design orders disabled'}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {dict.home.categoriesTitle}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/${locale}/products?category=${category.slug}`}
                  className="group block relative overflow-hidden rounded-2xl bg-card border border-border h-48 transition-all hover:shadow-lg hover:border-primary/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {locale === 'fa' ? category.name_fa : category.name_en}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        {dict.home.viewAll}
                        <ArrowIcon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              {dict.home.featuredProducts}
            </h2>
            <Link href={`/${locale}/products`}>
              <Button variant="ghost" className="gap-2">
                {dict.home.viewAll}
                <ArrowIcon className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} locale={locale} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {dict.products.noProducts}
            </div>
          )}
        </div>
      </section>

      {/* Custom Order CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Palette className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {dict.home.customOrderTitle}
            </h2>
            <p className="text-lg opacity-90 mb-8">
              {dict.home.customOrderDescription}
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-base px-8"
              disabled
            >
              {locale === 'fa' ? 'فعلا غیرفعال' : 'Currently disabled'}
              <ArrowIcon className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
