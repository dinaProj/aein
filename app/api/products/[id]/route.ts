import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { deleteProduct, updateProduct } from '@/lib/local-db'
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

function isAuthorized(request: NextRequest) {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  return isAdminSessionValid(session)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const product = await request.json()
    await updateProduct(id, product)

    revalidatePath('/admin/products')
    revalidatePath('/admin/dashboard')
    revalidatePath('/fa')
    revalidatePath('/en')
    revalidatePath('/fa/products')
    revalidatePath('/en/products')
    revalidatePath(`/fa/products/${id}`)
    revalidatePath(`/en/products/${id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Failed to update product. Check server write permissions or persistent storage.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    await deleteProduct(id)

    revalidatePath('/admin/products')
    revalidatePath('/admin/dashboard')
    revalidatePath('/fa')
    revalidatePath('/en')
    revalidatePath('/fa/products')
    revalidatePath('/en/products')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product. Check server write permissions or persistent storage.' },
      { status: 500 }
    )
  }
}
