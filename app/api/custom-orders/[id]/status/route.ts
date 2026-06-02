import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { updateCustomOrderStatus } from '@/lib/local-db'
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from '@/lib/auth'
import type { CustomOrder } from '@/lib/types'

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
    const { status } = (await request.json()) as { status: CustomOrder['status'] }
    await updateCustomOrderStatus(id, status)

    revalidatePath('/admin/custom-orders')
    revalidatePath('/admin/dashboard')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update custom order status error:', error)
    return NextResponse.json(
      { error: 'Failed to update custom order. Check server write permissions or persistent storage.' },
      { status: 500 }
    )
  }
}
