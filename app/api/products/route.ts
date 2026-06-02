import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { saveProduct } from '@/lib/local-db'
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    if (!isAdminSessionValid(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await request.json()
    await saveProduct(product)

    revalidatePath('/admin/products')
    revalidatePath('/admin/dashboard')
    revalidatePath('/fa')
    revalidatePath('/en')
    revalidatePath('/fa/products')
    revalidatePath('/en/products')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to save product. Check server write permissions or persistent storage.' },
      { status: 500 }
    )
  }
}
