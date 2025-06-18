/**
 * Middleware de Next.js para protección de rutas y autenticación
 * Maneja la autenticación y autorización en rutas protegidas
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, RolUsuario } from '@/lib/auth';

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/admin',
  '/resident', 
  '/reception',
  '/api/admin',
  '/api/resident',
  '/api/reception',
  '/api/user',
];

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/api/auth',
  '/api/public',
];

// Mapeo de rutas a roles requeridos
const ROUTE_ROLES: Record<string, RolUsuario[]> = {
  '/admin': [RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_CONJUNTO],
  '/api/admin': [RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_CONJUNTO],
  
  '/resident': [
    RolUsuario.SUPER_ADMIN, 
    RolUsuario.ADMIN_CONJUNTO, 
    RolUsuario.RESIDENTE, 
    RolUsuario.PROPIETARIO
  ],
  '/api/resident': [
    RolUsuario.SUPER_ADMIN, 
    RolUsuario.ADMIN_CONJUNTO, 
    RolUsuario.RESIDENTE, 
    RolUsuario.PROPIETARIO
  ],
  
  '/reception': [
    RolUsuario.SUPER_ADMIN, 
    RolUsuario.ADMIN_CONJUNTO, 
    RolUsuario.RECEPCION, 
    RolUsuario.VIGILANCIA
  ],
  '/api/reception': [
    RolUsuario.SUPER_ADMIN, 
    RolUsuario.ADMIN_CONJUNTO, 
    RolUsuario.RECEPCION, 
    RolUsuario.VIGILANCIA
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si es una ruta pública
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Verificar si es una ruta protegida
  if (isProtectedRoute(pathname)) {
    return handleProtectedRoute(request);
  }

  // Por defecto, permitir acceso
  return NextResponse.next();
}

/**
 * Verifica si una ruta es pública
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Verifica si una ruta está protegida
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Maneja el acceso a rutas protegidas
 */
function handleProtectedRoute(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Obtener token de autenticación
  const token = getAuthToken(request);
  
  if (!token) {
    return redirectToLogin(request);
  }

  // Verificar token
  const user = verifyAccessToken(token);
  if (!user) {
    return redirectToLogin(request);
  }

  // Verificar autorización por rol
  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.rol)) {
    return redirectToUnauthorized(request);
  }

  // Agregar headers con información del usuario
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.userId);
  response.headers.set('x-user-role', user.rol);
  response.headers.set('x-user-email', user.email);
  
  if (user.conjuntoId) {
    response.headers.set('x-conjunto-id', user.conjuntoId);
  }
  
  if (user.tenantId) {
    response.headers.set('x-tenant-id', user.tenantId);
  }

  return response;
}

/**
 * Obtiene el token de autenticación de cookies o headers
 */
function getAuthToken(request: NextRequest): string | null {
  // Primero intentar desde cookies
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Luego intentar desde header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Obtiene los roles requeridos para una ruta
 */
function getRequiredRoles(pathname: string): RolUsuario[] {
  for (const [route, roles] of Object.entries(ROUTE_ROLES)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return roles;
    }
  }
  return [];
}

/**
 * Redirige al login con la URL de retorno
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
  
  return NextResponse.redirect(loginUrl);
}

/**
 * Redirige a página de no autorizado
 */
function redirectToUnauthorized(request: NextRequest): NextResponse {
  const unauthorizedUrl = new URL('/auth/unauthorized', request.url);
  return NextResponse.redirect(unauthorizedUrl);
}

/**
 * Maneja rutas de API con respuesta JSON
 */
function createUnauthorizedApiResponse(): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      message: 'No autorizado', 
      error: 'Token de autenticación requerido' 
    },
    { status: 401 }
  );
}

/**
 * Maneja rutas de API con respuesta de permisos insuficientes
 */
function createForbiddenApiResponse(): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Permisos insuficientes', 
      error: 'No tienes permisos para acceder a este recurso' 
    },
    { status: 403 }
  );
}

// Configuración del matcher para definir en qué rutas aplicar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
