'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Filter, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDictionary, getDirection } from '@/lib/dictionaries'
import type { Locale, Product, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProductCard } from '@/components/product-card'

interface ProductsContentProps {
  locale: Locale
  products: Product[]
  categories: Category[]
  initialCategory?: string
}

type SortOption = 'newest' | 'price_asc' | 'price_desc'

export function ProductsContent({
  locale,
  products,
  categories,
  initialCategory,
}: ProductsContentProps) {
  const dict = getDictionary(locale)
  const dir = getDirection(locale)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  )
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = selectedCategory
      ? products.filter((p) => {
          const category = categories.find((c) => c.id === p.category_id)
          return category?.slug === selectedCategory
        })
      : products

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [products, categories, selectedCategory, sortBy])

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'price_asc':
        return dict.products.priceAsc
      case 'price_desc':
        return dict.products.priceDesc
      case 'newest':
      default:
        return dict.products.newest
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {dict.products.title}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'fa'
              ? `${filteredAndSortedProducts.length} محصول`
              : `${filteredAndSortedProducts.length} products`}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {dict.products.allCategories}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.slug)}
              >
                {locale === 'fa' ? category.name_fa : category.name_en}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <div className={cn('flex-1', dir === 'rtl' ? 'text-left' : 'text-right')}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {getSortLabel(sortBy)}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  {dict.products.newest}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price_asc')}>
                  {dict.products.priceAsc}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price_desc')}>
                  {dict.products.priceDesc}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} locale={locale} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg">
              {dict.products.noProducts}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
