import { NextRequest, NextResponse } from 'next/server'
import { deleteProduct, updateProduct } from '@/lib/local-db'
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from '@/lib/auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

function isAuthorized(request: NextRequest) {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  return isAdminSessionValid(session)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const product = await request.json()
  await updateProduct(id, product)

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  await deleteProduct(id)

  return NextResponse.json({ success: true })
}
