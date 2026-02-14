import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/account']
const ADMIN_PATHS = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for session cookie (set after Firebase auth login)
  const sessionCookie = request.cookies.get('session')?.value

  // Protect /account/* routes
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect /admin/* routes
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin role from cookie
    const role = request.cookies.get('role')?.value
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
}
