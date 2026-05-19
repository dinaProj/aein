import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['fa', 'en']
const defaultLocale = 'fa'

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameLocale) return pathnameLocale

  const cookieLocale = request.cookies.get('locale')?.value
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale

  return defaultLocale
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  const locale = getLocale(request)
  const newUrl = new URL(`/${locale}${pathname}`, request.url)
  newUrl.search = request.nextUrl.search

  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
