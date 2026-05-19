import { NextRequest, NextResponse } from 'next/server'
import { saveProduct } from '@/lib/local-db'
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!isAdminSessionValid(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const product = await request.json()
  await saveProduct(product)

  return NextResponse.json({ success: true })
}
