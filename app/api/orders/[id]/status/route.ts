import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { updateOrderStatus } from '@/lib/local-db'
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from '@/lib/auth'
import type { Order } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    if (!isAdminSessionValid(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const { status } = (await request.json()) as { status: Order['status'] }
    await updateOrderStatus(id, status)

    revalidatePath('/admin/orders')
    revalidatePath('/admin/dashboard')
    revalidatePath('/fa/account')
    revalidatePath('/en/account')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update order status error:', error)
    return NextResponse.json(
      { error: 'Failed to update order. Check server write permissions or persistent storage.' },
      { status: 500 }
    )
  }
}
