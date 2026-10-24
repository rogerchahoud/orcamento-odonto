import { auth } from '@/lib/auth/server'

export default auth.middleware({ loginUrl: '/auth/sign-in' })

export const config = {
  // Protege as páginas do app; deixa de fora API, páginas de auth e assets.
  matcher: ['/((?!api|auth|_next/static|_next/image|favicon.ico).*)'],
}
