import { NextRequest, NextResponse } from 'next/server'
import { validateAdminCredentials, generateSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const sessionToken = generateSessionToken()
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    )

    // Set secure session cookie
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
