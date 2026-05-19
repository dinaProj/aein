'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Package, UserRound } from 'lucide-react'
import type { CustomerAccount, Locale, Order } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AccountContentProps {
  locale: Locale
  customer: CustomerAccount | null
  orders: Order[]
  redirectTo?: string
}

const statusLabels: Record<Order['status'], { fa: string; en: string }> = {
  pending: { fa: 'در انتظار تایید', en: 'Pending' },
  processing: { fa: 'در حال انجام', en: 'Processing' },
  shipped: { fa: 'ارسال شده', en: 'Shipped' },
  delivered: { fa: 'تحویل داده شده', en: 'Delivered' },
  cancelled: { fa: 'لغو شده', en: 'Cancelled' },
}

export function AccountContent({
  locale,
  customer,
  orders,
  redirectTo,
}: AccountContentProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [registerStep, setRegisterStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const afterAuth = () => {
    router.push(redirectTo || `/${locale}/account`)
    router.refresh()
  }

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const form = new FormData(event.currentTarget)
    const loginPhone = String(form.get('phone') || '').trim()
    const password = String(form.get('password') || '')

    try {
      const response = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, password }),
      })

      if (!response.ok) {
        throw new Error('login failed')
      }

      afterAuth()
    } catch {
      setMessage(locale === 'fa' ? 'شماره یا رمز عبور اشتباه است.' : 'Phone or password is incorrect.')
    } finally {
      setIsLoading(false)
    }
  }

  const sendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setDevCode(null)

    const form = new FormData(event.currentTarget)
    const registerPhone = String(form.get('phone') || '').trim()

    try {
      const response = await fetch('/api/customer/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: registerPhone }),
      })
      const data = (await response.json()) as { devCode?: string }

      if (!response.ok) {
        throw new Error('send failed')
      }

      setPhone(registerPhone)
      setRegisterStep('code')
      setDevCode(data.devCode || null)
      setMessage(locale === 'fa' ? 'کد تایید ارسال شد.' : 'Verification code sent.')
    } catch {
      setMessage(
        locale === 'fa'
          ? 'ارسال کد انجام نشد. شماره را بررسی کنید یا اگر حساب دارید وارد شوید.'
          : 'Could not send the code. Check the phone number or login if you already have an account.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const form = new FormData(event.currentTarget)
    const code = String(form.get('code') || '').trim()
    const password = String(form.get('password') || '')
    const passwordConfirm = String(form.get('password_confirm') || '')

    if (password.length < 6 || password !== passwordConfirm) {
      setMessage(
        locale === 'fa'
          ? 'رمز باید حداقل ۶ کاراکتر باشد و با تکرار رمز یکی باشد.'
          : 'Password must be at least 6 characters and match the confirmation.'
      )
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/customer/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, password }),
      })

      if (!response.ok) {
        throw new Error('register failed')
      }

      afterAuth()
    } catch {
      setMessage(locale === 'fa' ? 'کد تایید اشتباه یا منقضی شده است.' : 'The code is invalid or expired.')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/customer/logout', { method: 'POST' })
    router.push(`/${locale}/account`)
    router.refresh()
  }

  if (!customer) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-md">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <UserRound className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">
                    {locale === 'fa' ? 'پنل کاربری' : 'Account'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'fa'
                      ? 'برای خرید وارد شوید یا حساب جدید بسازید.'
                      : 'Login or create an account before placing an order.'}
                  </p>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 rounded-md border p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setMessage(null)
                  }}
                  className={`rounded px-3 py-2 text-sm font-medium ${
                    mode === 'login' ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  {locale === 'fa' ? 'ورود' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setRegisterStep('phone')
                    setMessage(null)
                  }}
                  className={`rounded px-3 py-2 text-sm font-medium ${
                    mode === 'register' ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  {locale === 'fa' ? 'ثبت‌نام' : 'Register'}
                </button>
              </div>

              {mode === 'login' ? (
                <form className="space-y-4" onSubmit={login}>
                  <div className="space-y-2">
                    <Label htmlFor="login-phone">{locale === 'fa' ? 'شماره موبایل' : 'Phone'}</Label>
                    <Input id="login-phone" name="phone" inputMode="tel" placeholder="09123456789" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{locale === 'fa' ? 'رمز عبور' : 'Password'}</Label>
                    <Input id="login-password" name="password" type="password" minLength={6} required />
                  </div>
                  {message && <p className="text-sm text-destructive">{message}</p>}
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (locale === 'fa' ? 'در حال ورود...' : 'Logging in...') : locale === 'fa' ? 'ورود' : 'Login'}
                  </Button>
                </form>
              ) : registerStep === 'phone' ? (
                <form className="space-y-4" onSubmit={sendCode}>
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">{locale === 'fa' ? 'شماره موبایل' : 'Phone'}</Label>
                    <Input id="register-phone" name="phone" inputMode="tel" placeholder="09123456789" required />
                  </div>
                  {message && <p className="text-sm text-destructive">{message}</p>}
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading
                      ? locale === 'fa'
                        ? 'در حال ارسال...'
                        : 'Sending...'
                      : locale === 'fa'
                        ? 'ارسال کد ثبت‌نام'
                        : 'Send Register Code'}
                  </Button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={register}>
                  <div className="rounded-md border bg-secondary/50 p-3 text-sm text-muted-foreground">
                    {locale === 'fa' ? `کد ثبت‌نام به ${phone} ارسال شد.` : `Register code sent to ${phone}.`}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">{locale === 'fa' ? 'کد تایید' : 'Verification Code'}</Label>
                    <Input id="code" name="code" inputMode="numeric" maxLength={6} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{locale === 'fa' ? 'رمز عبور' : 'Password'}</Label>
                    <Input id="password" name="password" type="password" minLength={6} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-confirm">{locale === 'fa' ? 'تکرار رمز عبور' : 'Confirm Password'}</Label>
                    <Input id="password-confirm" name="password_confirm" type="password" minLength={6} required />
                  </div>

                  {devCode && (
                    <p className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-700">
                      {locale === 'fa'
                        ? `حالت تست: کد شما ${devCode} است.`
                        : `Dev mode: your code is ${devCode}.`}
                    </p>
                  )}
                  {message && <p className="text-sm text-destructive">{message}</p>}

                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (locale === 'fa' ? 'در حال ثبت‌نام...' : 'Registering...') : locale === 'fa' ? 'ثبت‌نام' : 'Register'}
                  </Button>
                  <Button
                    className="w-full"
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setRegisterStep('phone')
                      setMessage(null)
                      setDevCode(null)
                    }}
                  >
                    {locale === 'fa' ? 'تغییر شماره' : 'Change Phone'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {locale === 'fa' ? 'پنل کاربری' : 'Account'}
            </h1>
            <p className="mt-2 text-muted-foreground">{customer.phone}</p>
          </div>
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            {locale === 'fa' ? 'خروج' : 'Logout'}
          </Button>
        </div>

        <h2 className="mb-4 text-xl font-bold">
          {locale === 'fa' ? 'سفارش‌های من' : 'My Orders'}
        </h2>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <Package className="mx-auto mb-3 h-12 w-12 opacity-60" />
              {locale === 'fa' ? 'هنوز سفارشی ثبت نکرده‌اید.' : 'No orders yet.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const total = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
                style: 'currency',
                currency: locale === 'fa' ? 'IRR' : 'USD',
                maximumFractionDigits: 0,
              }).format(order.total_amount)

              return (
                <Card key={order.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="mt-1 font-semibold">
                          {statusLabels[order.status]?.[locale] || order.status}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-primary">{total}</p>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {order.items.map((item, index) => (
                        <p key={`${item.product.id}-${index}`}>
                          {(locale === 'fa' ? item.product.title_fa : item.product.title_en) || 'Product'} x{item.quantity}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
