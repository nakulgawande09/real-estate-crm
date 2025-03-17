import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from './lib/enums';

// Define role-based access control for routes
const routePermissions: Record<string, UserRole[]> = {
  '/dashboard': [UserRole.ADMIN, UserRole.CEO, UserRole.AGENT, UserRole.SUPPORT_STAFF],
  '/dashboard/projects': [UserRole.ADMIN, UserRole.CEO, UserRole.AGENT, UserRole.SUPPORT_STAFF],
  '/dashboard/clients': [UserRole.ADMIN, UserRole.CEO, UserRole.AGENT, UserRole.SUPPORT_STAFF],
  '/dashboard/transactions': [UserRole.ADMIN, UserRole.CEO, UserRole.AGENT, UserRole.SUPPORT_STAFF],
  '/dashboard/analytics': [UserRole.ADMIN, UserRole.CEO],
  '/dashboard/settings': [UserRole.ADMIN, UserRole.CEO],
  '/dashboard/users': [UserRole.ADMIN, UserRole.CEO],
  '/api/users': [UserRole.ADMIN, UserRole.CEO],
  '/api/projects': [UserRole.ADMIN, UserRole.CEO, UserRole.AGENT, UserRole.SUPPORT_STAFF],
  '/api/clients': [UserRole.ADMIN, UserRole.CEO, UserRole.AGENT, UserRole.SUPPORT_STAFF],
  '/api/transactions': [UserRole.ADMIN, UserRole.CEO, UserRole.AGENT],
};

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/error',
  '/unauthorized',
  '/test-login',
  '/api/auth/csrf',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/session',
  '/api/auth/providers',
  '/api/auth/callback',
  '/api/auth/demo-user',
  '/api/auth/test-credentials',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is for static assets or public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/auth/') ||
    pathname.includes('.') ||
    publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  ) {
    return NextResponse.next();
  }

  // Get the NextAuth.js token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if no token
  if (!token) {
    console.log('No token found, redirecting to sign-in page. Path:', pathname);
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Check if user is active
  if (token.isActive === false) {
    console.log('User is not active, redirecting to sign-in with error. Path:', pathname);
    return NextResponse.redirect(new URL('/auth/signin?error=Account%20is%20deactivated', request.url));
  }

  // Check route permissions
  const userRole = token.role as UserRole;
  
  // Determine which path pattern to check against for permissions
  const matchingRoute = Object.keys(routePermissions).find(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(`${route}/`)) return true;
    return false;
  });
  
  if (matchingRoute && !routePermissions[matchingRoute].includes(userRole)) {
    console.log('User does not have permission for route, redirecting to unauthorized. Path:', pathname, 'Role:', userRole);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}; 