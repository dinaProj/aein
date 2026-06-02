'use client'

import { FormEvent, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Upload,
} from 'lucide-react'
import { getDictionary, getDirection } from '@/lib/dictionaries'
import { formatRial } from '@/lib/format'
import { useCartStore } from '@/lib/store'
import type { Locale } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CartContentProps {
  locale: Locale
}

const bankCard = {
  number: process.env.NEXT_PUBLIC_BANK_CARD_NUMBER || '5022-2913-3299-5768',
  owner: process.env.NEXT_PUBLIC_BANK_CARD_OWNER || 'محمد کسری بابازاده',
}

export function CartContent({ locale }: CartContentProps) {
  const router = useRouter()
  const dict = getDictionary(locale)
  const dir = getDirection(locale)
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const formattedTotal = useMemo(
    () => formatRial(getTotalPrice(), locale),
    [getTotalPrice, items, locale]
  )

  const copyCardNumber = async () => {
    await navigator.clipboard.writeText(bankCard.number.replaceAll('-', ''))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const openCheckout = async () => {
    const response = await fetch('/api/customer/me')
    const data = (await response.json()) as { customer: unknown }

    if (!data.customer) {
      router.push(`/${locale}/account?redirect=/${locale}/cart`)
      return
    }

    setCheckoutOpen(true)
  }

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const form = new FormData(event.currentTarget)
      form.set('payment_method', 'card_to_card')
      form.set('items', JSON.stringify(items))

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/${locale}/account?redirect=/${locale}/cart`)
          return
        }
        throw new Error('failed')
      }

      clearCart()
      setCheckoutOpen(false)
      setMessage(
        locale === 'fa'
          ? 'سفارش ثبت شد و پس از تایید ادمین وارد مرحله انجام می‌شود.'
          : 'Your order was submitted and will start processing after admin approval.'
      )
    } catch {
      setMessage(
        locale === 'fa'
          ? 'ثبت سفارش انجام نشد. لطفا اطلاعات و فایل فیش را بررسی کنید.'
          : 'Order submission failed. Please check the form and receipt file.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0 && !message) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center py-16"
          >
            <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">{dict.cart.empty}</h1>
            <Link href={`/${locale}/products`}>
              <Button>{dict.cart.continueShopping}</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-8"
        >
          {dict.cart.title}
        </motion.h1>

        {message && items.length === 0 ? (
          <Card className="max-w-xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-14 w-14 mx-auto mb-4 text-green-600" />
              <h2 className="text-xl font-bold mb-3">
                {locale === 'fa' ? 'سفارش شما ثبت شد' : 'Order Submitted'}
              </h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Link href={`/${locale}/account`}>
                <Button>{locale === 'fa' ? 'مشاهده پنل کاربری' : 'View Account'}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => {
                  const title = locale === 'fa' ? item.product.title_fa : item.product.title_en
                  const itemPrice = formatRial(item.product.price * item.quantity, locale)

                  return (
                    <motion.div
                      key={`${item.product.id}-${item.selectedSize}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: dir === 'rtl' ? 100 : -100 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={item.product.images[0] || '/placeholder.jpg'}
                                alt={title}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/${locale}/products/${item.product.id}`}
                                className="font-semibold hover:text-primary transition-colors line-clamp-1"
                              >
                                {title}
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.selectedSize && item.selectedSize !== 'default'
                                  ? `${dict.cart.size}: ${item.selectedSize}`
                                  : locale === 'fa'
                                    ? 'بدون سایز'
                                    : 'No size'}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      updateQuantity(
                                        item.product.id,
                                        item.selectedSize,
                                        item.quantity - 1
                                      )
                                    }
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      updateQuantity(
                                        item.product.id,
                                        item.selectedSize,
                                        item.quantity + 1
                                      )
                                    }
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-primary">{itemPrice}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() =>
                                      removeItem(item.product.id, item.selectedSize)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">
                    {locale === 'fa' ? 'خلاصه سفارش' : 'Order Summary'}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{locale === 'fa' ? 'تعداد اقلام' : 'Items'}</span>
                      <span>{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-lg font-bold">
                      <span>{dict.cart.total}</span>
                      <span className="text-primary">{formattedTotal}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6" size="lg" onClick={openCheckout}>
                    {dict.cart.checkout}
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    {locale === 'fa'
                      ? 'برای ثبت سفارش باید وارد حساب کاربری شوید.'
                      : 'You must sign in before submitting an order.'}
                  </p>
                  <Link href={`/${locale}/products`} className="block mt-4">
                    <Button variant="outline" className="w-full">
                      {dict.cart.continueShopping}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{locale === 'fa' ? 'پرداخت سفارش' : 'Order Payment'}</DialogTitle>
            <DialogDescription>
              {locale === 'fa'
                ? 'پرداخت کارت به کارت فعال است. پس از ثبت فیش، سفارش در انتظار تایید ادمین می‌ماند.'
                : 'Card-to-card payment is active. Your order waits for admin approval after submission.'}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={submitOrder}>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-md border-2 border-primary bg-primary/5 p-4 text-start"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Banknote className="h-5 w-5 text-primary" />
                  {locale === 'fa' ? 'کارت به کارت' : 'Card to Card'}
                </span>
                <span className="mt-2 block text-sm text-muted-foreground">
                  {locale === 'fa' ? 'فعال' : 'Active'}
                </span>
              </button>
              <button
                type="button"
                disabled
                className="rounded-md border p-4 text-start opacity-55"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <CreditCard className="h-5 w-5" />
                  {locale === 'fa' ? 'درگاه پرداخت' : 'Payment Gateway'}
                </span>
                <span className="mt-2 block text-sm text-muted-foreground">
                  {locale === 'fa' ? 'فعلا غیرفعال' : 'Currently disabled'}
                </span>
              </button>
            </div>

            <div className="rounded-md border bg-secondary/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'fa' ? 'شماره کارت' : 'Card Number'}
                  </p>
                  <p className="mt-1 text-lg font-bold tracking-wider">{bankCard.number}</p>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={copyCardNumber}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">
                  {locale === 'fa' ? 'صاحب کارت' : 'Card Owner'}
                </p>
                <p className="font-semibold">{bankCard.owner}</p>
              </div>
              {copied && (
                <p className="mt-3 text-sm text-green-600">
                  {locale === 'fa' ? 'شماره کارت کپی شد.' : 'Card number copied.'}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">
                  {locale === 'fa' ? 'نام گیرنده' : 'Receiver Name'}
                </Label>
                <Input id="customer_name" name="customer_name" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="shipping_address">
                  {locale === 'fa' ? 'آدرس ارسال' : 'Shipping Address'}
                </Label>
                <Textarea id="shipping_address" name="shipping_address" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_tracking_number">
                  {locale === 'fa' ? 'شماره پیگیری واریز' : 'Payment Tracking Number'}
                </Label>
                <Input id="payment_tracking_number" name="payment_tracking_number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_receipt" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {locale === 'fa' ? 'آپلود فیش' : 'Upload Receipt'}
                </Label>
                <Input
                  id="payment_receipt"
                  name="payment_receipt"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  required
                />
              </div>
            </div>

            {message && <p className="text-sm text-muted-foreground">{message}</p>}

            <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? locale === 'fa'
                  ? 'در حال ثبت...'
                  : 'Submitting...'
                : locale === 'fa'
                  ? 'ثبت فیش و سفارش'
                  : 'Submit Receipt and Order'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
