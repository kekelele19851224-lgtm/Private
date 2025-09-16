import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    '/',
    '/app/parse',
    '/pricing',
    '/legal/(.*)',
    '/api/stripe/webhook',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ],
  
  // Routes that require authentication
  ignoredRoutes: [
    '/api/stripe/webhook', // Webhook should not be protected by auth
  ],
  
  // Redirect to sign-in for protected routes
  afterAuth(auth, req, evt) {
    // If user is signed in and on a public route, allow access
    if (auth.userId && auth.isPublicRoute) {
      return
    }
    
    // If user is not signed in and trying to access a protected route
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return Response.redirect(signInUrl)
    }
    
    // Create user record if it doesn't exist
    if (auth.userId && !auth.isPublicRoute) {
      // This will be handled by the user sync webhook
    }
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}