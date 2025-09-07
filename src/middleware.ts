// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verificar se o usuário está autenticado
  // const token = request.cookies.get('hcm-auth-token')
  // const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  // const isPublicPage = request.nextUrl.pathname === '/' || isAuthPage

  // if (!token && !isPublicPage) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  // if (token && isAuthPage) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  // return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
