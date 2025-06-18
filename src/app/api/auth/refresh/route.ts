/**
 * Endpoint de Refresh Token - POST /api/auth/refresh
 * Renovación de tokens de acceso usando refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  verifyRefreshToken,
  generateAuthTokens,
  createAuthSuccessResponse,
  createAuthErrorResponse,
  AUTH_CONSTANTS 
} from '@/lib/auth';
import { RolUsuario } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Obtener refresh token de cookies o body
    let refreshToken: string | undefined;

    // Primero intentar desde cookies
    refreshToken = request.cookies.get('refresh-token')?.value;

    // Si no está en cookies, intentar desde body
    if (!refreshToken) {
      const body = await request.json().catch(() => ({}));
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json(
        createAuthErrorResponse('Token de refresh requerido'),
        { status: 401 }
      );
    }

    // Verificar refresh token
    const tokenPayload = verifyRefreshToken(refreshToken);
    if (!tokenPayload) {
      return NextResponse.json(
        createAuthErrorResponse('Token de refresh inválido o expirado'),
        { status: 401 }
      );
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: tokenPayload.userId },
      include: {
        conjunto: {
          select: {
            id: true,
            nombre: true,
            tenantId: true,
            plan: true,
            activo: true,
          }
        }
      }
    });

    if (!usuario) {
      return NextResponse.json(
        createAuthErrorResponse('Usuario no encontrado'),
        { status: 404 }
      );
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return NextResponse.json(
        createAuthErrorResponse('Cuenta desactivada'),
        { status: 403 }
      );
    }

    // Verificar si el conjunto está activo (excepto super admin)
    if (usuario.rol !== RolUsuario.SUPER_ADMIN && usuario.conjunto && !usuario.conjunto.activo) {
      return NextResponse.json(
        createAuthErrorResponse('Conjunto desactivado'),
        { status: 403 }
      );
    }

    // Preparar datos del usuario
    const authUser = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      conjuntoId: usuario.conjuntoId,
      tenantId: usuario.conjunto?.tenantId,
      nombreCompleto: usuario.nombreCompleto,
      activo: usuario.activo,
      emailVerificado: usuario.emailVerificado,
    };

    // Generar nuevos tokens
    const tokens = generateAuthTokens(authUser);

    // Crear respuesta con nuevos tokens
    const response = NextResponse.json(
      createAuthSuccessResponse(authUser, tokens, 'Tokens renovados exitosamente')
    );

    // Actualizar cookies con nuevos tokens
    response.cookies.set('auth-token', tokens.accessToken, AUTH_CONSTANTS.COOKIE_OPTIONS);
    response.cookies.set('refresh-token', tokens.refreshToken, {
      ...AUTH_CONSTANTS.COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días para refresh token
    });

    return response;

  } catch (error) {
    console.error('Error en refresh token:', error);
    return NextResponse.json(
      createAuthErrorResponse('Error interno del servidor'),
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
