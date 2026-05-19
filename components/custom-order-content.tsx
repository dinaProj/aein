'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDictionary, getDirection } from '@/lib/dictionaries'
import type { Locale } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface CustomOrderContentProps {
  locale: Locale
}

export function CustomOrderContent({ locale }: CustomOrderContentProps) {
  const dict = getDictionary(locale)
  const dir = getDirection(locale)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    product_type: 'canvas',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to submit custom order')

      setIsSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        product_type: 'canvas',
        description: '',
      })
    } catch (error) {
      console.error('Error submitting custom order:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-16"
          >
            <CheckCircle className="h-20 w-20 mx-auto mb-6 text-green-500" />
            <h1 className="text-2xl font-bold mb-4">{dict.customOrder.successTitle}</h1>
            <p className="text-muted-foreground mb-8">
              {dict.customOrder.successMessage}
            </p>
            <Button onClick={() => setIsSuccess(false)} variant="outline">
              {locale === 'fa' ? 'ثبت سفارش جدید' : 'Submit Another Order'}
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
            >
              <Palette className="h-10 w-10 text-primary" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {dict.customOrder.title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {dict.customOrder.subtitle}
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {dict.customOrder.nameLabel} *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {dict.customOrder.emailLabel} *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {dict.customOrder.phoneLabel}
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {dict.customOrder.productTypeLabel} *
                    </label>
                    <select
                      required
                      value={formData.product_type}
                      onChange={(e) =>
                        setFormData({ ...formData, product_type: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="canvas">{dict.customOrder.canvas}</option>
                      <option value="tshirt">{dict.customOrder.tshirt}</option>
                      <option value="poster">{dict.customOrder.poster}</option>
                      <option value="other">{dict.customOrder.other}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {dict.customOrder.descriptionLabel} *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                    placeholder={
                      locale === 'fa'
                        ? 'توضیحات طرح مورد نظر خود را بنویسید...'
                        : 'Describe your design idea...'
                    }
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">
                      {locale === 'fa' ? 'در حال ارسال...' : 'Submitting...'}
                    </span>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      {dict.customOrder.submitButton}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
