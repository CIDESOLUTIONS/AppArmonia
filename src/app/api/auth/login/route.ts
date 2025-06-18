/**
 * Endpoint de Login - POST /api/auth/login
 * Autenticación de usuarios con email y contraseña
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  verifyPassword, 
  generateAuthTokens, 
  createAuthSuccessResponse, 
  createAuthErrorResponse,
  AUTH_CONSTANTS 
} from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { RolUsuario } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        createAuthErrorResponse(
          'Datos de entrada inválidos',
          validationResult.error.errors[0]?.message
        ),
        { status: 400 }
      );
    }

    const { email, password, remember } = validationResult.data;

    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
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
        createAuthErrorResponse('Credenciales inválidas'),
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return NextResponse.json(
        createAuthErrorResponse('Cuenta desactivada. Contacte al administrador.'),
        { status: 403 }
      );
    }

    // Verificar si el conjunto está activo (excepto super admin)
    if (usuario.rol !== RolUsuario.SUPER_ADMIN && usuario.conjunto && !usuario.conjunto.activo) {
      return NextResponse.json(
        createAuthErrorResponse('Conjunto desactivado. Contacte al administrador.'),
        { status: 403 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, usuario.password);
    if (!isValidPassword) {
      return NextResponse.json(
        createAuthErrorResponse('Credenciales inválidas'),
        { status: 401 }
      );
    }

    // Actualizar último login
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { 
        ultimoLogin: new Date(),
      }
    });

    // Preparar datos del usuario para el token
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

    // Generar tokens
    const tokens = generateAuthTokens(authUser);

    // Crear respuesta con cookies seguras
    const response = NextResponse.json(
      createAuthSuccessResponse(authUser, tokens, 'Inicio de sesión exitoso')
    );

    // Configurar cookies
    const cookieOptions = {
      ...AUTH_CONSTANTS.COOKIE_OPTIONS,
      maxAge: remember ? AUTH_CONSTANTS.COOKIE_OPTIONS.maxAge : undefined, // Sesión persistente si remember=true
    };

    response.cookies.set('auth-token', tokens.accessToken, cookieOptions);
    response.cookies.set('refresh-token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días para refresh token
    });

    return response;

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      createAuthErrorResponse('Error interno del servidor'),
      { status: 500 }
    );
  }
}

// Opciones de CORS para el endpoint
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
