import { NextRequest, NextResponse } from 'next/server'
import { updateCustomOrderStatus } from '@/lib/local-db'
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from '@/lib/auth'
import type { CustomOrder } from '@/lib/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!isAdminSessionValid(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const { status } = (await request.json()) as { status: CustomOrder['status'] }
  await updateCustomOrderStatus(id, status)

  return NextResponse.json({ success: true })
}
