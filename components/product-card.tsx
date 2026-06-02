'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDictionary } from '@/lib/dictionaries'
import { formatRial } from '@/lib/format'
import { useCartStore } from '@/lib/store'
import type { Locale, Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ProductCardProps {
  product: Product
  locale: Locale
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const dict = getDictionary(locale)
  const addItem = useCartStore((state) => state.addItem)

  const title = locale === 'fa' ? product.title_fa : product.title_en
  const imageUrl = product.images[0] || '/placeholder.jpg'
  const formattedPrice = formatRial(product.price, locale)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock > 0) {
      addItem(product, product.sizes[0] || 'default')
    }
  }

  return (
    <Link href={`/${locale}/products/${product.id}`}>
      <Card className="group overflow-hidden border-border hover:border-primary/30 transition-all hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                {dict.products.outOfStock}
              </span>
            </div>
          )}
          {product.is_featured && (
            <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-full">
              {locale === 'fa' ? 'ویژه' : 'Featured'}
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formattedPrice}
            </span>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="gap-1.5 h-8"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{dict.products.addToCart}</span>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
