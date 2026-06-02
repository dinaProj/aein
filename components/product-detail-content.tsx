'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, ArrowRight, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDictionary, getDirection } from '@/lib/dictionaries'
import { formatRial } from '@/lib/format'
import { useCartStore } from '@/lib/store'
import type { Locale, Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ProductDetailContentProps {
  locale: Locale
  product: Product
}

export function ProductDetailContent({ locale, product }: ProductDetailContentProps) {
  const dict = getDictionary(locale)
  const dir = getDirection(locale)
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes.length > 0 ? product.sizes[0] : 'default'
  )
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const ArrowBackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft
  const title = locale === 'fa' ? product.title_fa : product.title_en
  const description = locale === 'fa' ? product.description_fa : product.description_en
  const formattedPrice = formatRial(product.price, locale)

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addItem(product, selectedSize || 'default')
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href={`/${locale}/products`}>
            <Button variant="ghost" className="gap-2">
              <ArrowBackIcon className="h-4 w-4" />
              {dict.products.title}
            </Button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
              <Image
                src={product.images[selectedImage] || '/placeholder.jpg'}
                alt={title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${title} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
            
            <div className="text-3xl font-bold text-primary mb-6">
              {formattedPrice}
            </div>

            {description && (
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {description}
              </p>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-3">{dict.products.selectSize}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'px-4 py-2 rounded-lg border-2 font-medium transition-all',
                        selectedSize === size
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="gap-2"
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    {locale === 'fa' ? 'اضافه شد!' : 'Added!'}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    {product.stock > 0 ? dict.products.addToCart : dict.products.outOfStock}
                  </>
                )}
              </Button>

              {product.payment_link && (
                <a
                  href={product.payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    <ExternalLink className="h-5 w-5" />
                    {locale === 'fa' ? 'پرداخت مستقیم' : 'Direct Payment'}
                  </Button>
                </a>
              )}
            </div>

            {/* Stock Info */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="mt-4 text-sm text-accent">
                {locale === 'fa'
                  ? `فقط ${product.stock} عدد باقی‌مانده!`
                  : `Only ${product.stock} left in stock!`}
              </p>
            )}
            {product.stock === 0 && (
              <p className="mt-4 text-sm font-medium text-destructive">
                {dict.products.outOfStock}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
