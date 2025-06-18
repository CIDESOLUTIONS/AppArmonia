/**
 * Sistema de Autenticación JWT para Armonía
 * Manejo de tokens, sesiones y autorización por roles
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { RolUsuario } from '@prisma/client';

// =============================================
// CONFIGURACIÓN JWT
// =============================================

const JWT_SECRET = process.env.JWT_SECRET || 'armonia_jwt_secret_fallback';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'armonia_refresh_secret_fallback';

export const JWT_CONFIG = {
  accessTokenExpiry: '15m',      // 15 minutos
  refreshTokenExpiry: '7d',      // 7 días
  passwordResetExpiry: '1h',     // 1 hora
  emailVerificationExpiry: '24h', // 24 horas
};

// =============================================
// TIPOS Y INTERFACES
// =============================================

export interface JWTPayload {
  userId: string;
  email: string;
  rol: RolUsuario;
  conjuntoId?: string;
  tenantId?: string;
  nombreCompleto: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  rol: RolUsuario;
  conjuntoId?: string;
  tenantId?: string;
  nombreCompleto: string;
  activo: boolean;
  emailVerificado: boolean;
}

// =============================================
// UTILIDADES DE HASH Y VALIDACIÓN
// =============================================

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Genera una contraseña temporal segura
 */
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// =============================================
// GESTIÓN DE TOKENS JWT
// =============================================

/**
 * Genera un token de acceso JWT
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_CONFIG.accessTokenExpiry,
    issuer: 'armonia-app',
    audience: 'armonia-users',
  });
}

/**
 * Genera un token de refresh JWT
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_CONFIG.refreshTokenExpiry,
    issuer: 'armonia-app',
    audience: 'armonia-refresh',
  });
}

/**
 * Genera ambos tokens (acceso y refresh)
 */
export function generateAuthTokens(user: AuthUser): AuthTokens {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    rol: user.rol,
    conjuntoId: user.conjuntoId,
    tenantId: user.tenantId,
    nombreCompleto: user.nombreCompleto,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutos en segundos
  };
}

/**
 * Verifica y decodifica un token de acceso
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'armonia-app',
      audience: 'armonia-users',
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('Error al verificar token de acceso:', error);
    return null;
  }
}

/**
 * Verifica y decodifica un token de refresh
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'armonia-app',
      audience: 'armonia-refresh',
    }) as { userId: string };
    
    return decoded;
  } catch (error) {
    console.error('Error al verificar token de refresh:', error);
    return null;
  }
}

/**
 * Genera un token para recuperación de contraseña
 */
export function generatePasswordResetToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: 'password-reset' },
    JWT_SECRET,
    { expiresIn: JWT_CONFIG.passwordResetExpiry }
  );
}

/**
 * Verifica un token de recuperación de contraseña
 */
export function verifyPasswordResetToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.type !== 'password-reset') {
      return null;
    }
    
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    console.error('Error al verificar token de recuperación:', error);
    return null;
  }
}

/**
 * Genera un token para verificación de email
 */
export function generateEmailVerificationToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: 'email-verification' },
    JWT_SECRET,
    { expiresIn: JWT_CONFIG.emailVerificationExpiry }
  );
}

/**
 * Verifica un token de verificación de email
 */
export function verifyEmailVerificationToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.type !== 'email-verification') {
      return null;
    }
    
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    console.error('Error al verificar token de verificación de email:', error);
    return null;
  }
}

// =============================================
// AUTORIZACIÓN POR ROLES
// =============================================

export const ROLES_HIERARCHY = {
  [RolUsuario.SUPER_ADMIN]: 100,
  [RolUsuario.ADMIN_CONJUNTO]: 80,
  [RolUsuario.PROPIETARIO]: 60,
  [RolUsuario.RESIDENTE]: 40,
  [RolUsuario.RECEPCION]: 30,
  [RolUsuario.VIGILANCIA]: 20,
  [RolUsuario.MANTENIMIENTO]: 10,
};

/**
 * Verifica si un rol tiene permisos para acceder a un recurso
 */
export function hasPermission(userRole: RolUsuario, requiredRole: RolUsuario): boolean {
  const userLevel = ROLES_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLES_HIERARCHY[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Verifica si un usuario puede acceder a un conjunto específico
 */
export function canAccessConjunto(user: JWTPayload, conjuntoId: string): boolean {
  // Super admin puede acceder a cualquier conjunto
  if (user.rol === RolUsuario.SUPER_ADMIN) {
    return true;
  }
  
  // Otros roles solo pueden acceder a su propio conjunto
  return user.conjuntoId === conjuntoId;
}

/**
 * Obtiene los permisos específicos de un rol
 */
export function getRolePermissions(rol: RolUsuario): string[] {
  const permissions: Record<RolUsuario, string[]> = {
    [RolUsuario.SUPER_ADMIN]: [
      'conjuntos:*',
      'usuarios:*',
      'sistema:*',
      'reportes:*',
    ],
    [RolUsuario.ADMIN_CONJUNTO]: [
      'propiedades:*',
      'residentes:*',
      'asambleas:*',
      'finanzas:*',
      'pqr:*',
      'servicios:*',
      'reportes:conjunto',
    ],
    [RolUsuario.PROPIETARIO]: [
      'propiedades:read',
      'propiedades:update:own',
      'finanzas:read:own',
      'asambleas:participate',
      'servicios:reserve',
      'pqr:create',
      'pqr:read:own',
    ],
    [RolUsuario.RESIDENTE]: [
      'propiedades:read:own',
      'servicios:reserve',
      'pqr:create',
      'pqr:read:own',
      'asambleas:view',
    ],
    [RolUsuario.RECEPCION]: [
      'visitantes:*',
      'correspondencia:*',
      'pqr:read',
      'pqr:update:assigned',
    ],
    [RolUsuario.VIGILANCIA]: [
      'visitantes:*',
      'incidentes:*',
      'minutas:*',
      'pqr:read',
    ],
    [RolUsuario.MANTENIMIENTO]: [
      'pqr:read:maintenance',
      'pqr:update:maintenance',
      'servicios:read',
    ],
  };

  return permissions[rol] || [];
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function hasSpecificPermission(user: JWTPayload, permission: string): boolean {
  const userPermissions = getRolePermissions(user.rol);
  
  // Verificar permiso exacto
  if (userPermissions.includes(permission)) {
    return true;
  }
  
  // Verificar permiso con wildcard
  const permissionParts = permission.split(':');
  const wildcardPermission = `${permissionParts[0]}:*`;
  
  return userPermissions.includes(wildcardPermission);
}

// =============================================
// VALIDACIÓN DE SESIONES
// =============================================

export interface SessionInfo {
  isValid: boolean;
  user?: JWTPayload;
  error?: string;
}

/**
 * Valida una sesión desde el header Authorization
 */
export function validateSession(authHeader?: string): SessionInfo {
  if (!authHeader) {
    return { isValid: false, error: 'No se proporcionó token de autenticación' };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { isValid: false, error: 'Formato de token inválido' };
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    return { isValid: false, error: 'Token inválido o expirado' };
  }

  return { isValid: true, user: payload };
}

/**
 * Extrae información del usuario desde cookies (para SSR)
 */
export function getUserFromCookies(cookies: string): SessionInfo {
  // Parsear cookies para obtener el token
  const cookieObj: Record<string, string> = {};
  cookies.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      cookieObj[key] = decodeURIComponent(value);
    }
  });

  const token = cookieObj['auth-token'];
  if (!token) {
    return { isValid: false, error: 'No hay sesión activa' };
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return { isValid: false, error: 'Sesión expirada' };
  }

  return { isValid: true, user: payload };
}

// =============================================
// UTILIDADES DE RESPUESTA
// =============================================

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<AuthUser, 'password'>;
  tokens?: AuthTokens;
  error?: string;
}

/**
 * Crea una respuesta de autenticación exitosa
 */
export function createAuthSuccessResponse(
  user: AuthUser,
  tokens: AuthTokens,
  message = 'Autenticación exitosa'
): AuthResponse {
  const { ...userWithoutPassword } = user;
  
  return {
    success: true,
    message,
    user: userWithoutPassword,
    tokens,
  };
}

/**
 * Crea una respuesta de error de autenticación
 */
export function createAuthErrorResponse(
  message: string,
  error?: string
): AuthResponse {
  return {
    success: false,
    message,
    error,
  };
}

// =============================================
// CONSTANTES DE TIEMPO
// =============================================

export const AUTH_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos en ms
  SESSION_EXTEND_THRESHOLD: 5 * 60 * 1000, // 5 minutos en ms
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  },
};

// =============================================
// HELPERS PARA API ROUTES
// =============================================

/**
 * Obtiene el usuario autenticado desde una NextRequest
 * Utiliza el header Authorization o cookies como fallback
 */
export function getAuthenticatedUser(request: Request): SessionInfo {
  // Intentar obtener desde Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    return validateSession(authHeader);
  }

  // Intentar obtener desde cookies
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    return getUserFromCookies(cookieHeader);
  }

  return { isValid: false, error: 'No se encontraron credenciales de autenticación' };
}

/**
 * Interfaz para simular getServerSession de NextAuth
 * para compatibilidad con código existente
 */
export async function getServerSession(request?: Request): Promise<{ user?: JWTPayload } | null> {
  if (!request) {
    return null;
  }

  const session = getAuthenticatedUser(request);
  if (!session.isValid || !session.user) {
    return null;
  }

  return {
    user: {
      ...session.user,
      id: session.user.userId,
      role: session.user.rol,
    }
  };
}
