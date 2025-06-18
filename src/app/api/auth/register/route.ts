/**
 * Endpoint de Registro - POST /api/auth/register
 * Registro de nuevos usuarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  hashPassword,
  generateAuthTokens,
  generateEmailVerificationToken,
  createAuthSuccessResponse,
  createAuthErrorResponse,
  AUTH_CONSTANTS 
} from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { RolUsuario } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        createAuthErrorResponse(
          'Datos de entrada inválidos',
          validationResult.error.errors[0]?.message
        ),
        { status: 400 }
      );
    }

    const { 
      email, 
      telefono, 
      nombreCompleto, 
      password, 
      rol = RolUsuario.RESIDENTE,
      conjuntoId 
    } = validationResult.data;

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        createAuthErrorResponse('Ya existe una cuenta con este email'),
        { status: 409 }
      );
    }

    // Verificar si el conjunto existe (si se proporcionó)
    let conjunto = null;
    if (conjuntoId) {
      conjunto = await prisma.conjuntoResidencial.findUnique({
        where: { id: conjuntoId },
        select: { id: true, nombre: true, tenantId: true, activo: true }
      });

      if (!conjunto) {
        return NextResponse.json(
          createAuthErrorResponse('Conjunto residencial no encontrado'),
          { status: 404 }
        );
      }

      if (!conjunto.activo) {
        return NextResponse.json(
          createAuthErrorResponse('Conjunto residencial desactivado'),
          { status: 403 }
        );
      }
    }

    // Validar rol según contexto
    if (rol === RolUsuario.SUPER_ADMIN) {
      return NextResponse.json(
        createAuthErrorResponse('No se puede registrar como Super Administrador'),
        { status: 403 }
      );
    }

    if (rol !== RolUsuario.SUPER_ADMIN && !conjuntoId) {
      return NextResponse.json(
        createAuthErrorResponse('Debe especificar un conjunto residencial'),
        { status: 400 }
      );
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email: email.toLowerCase(),
        telefono,
        nombreCompleto,
        password: hashedPassword,
        rol,
        conjuntoId,
        activo: true,
        emailVerificado: false, // Requerirá verificación de email
      },
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

    // Generar token de verificación de email
    const verificationToken = generateEmailVerificationToken(
      nuevoUsuario.id,
      nuevoUsuario.email
    );

    // Aquí se podría enviar email de verificación
    // await sendVerificationEmail(nuevoUsuario.email, verificationToken);

    console.log(`🔗 Token de verificación para ${nuevoUsuario.email}: ${verificationToken}`);

    // Preparar datos del usuario para el token (si se desea auto-login)
    const authUser = {
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
      conjuntoId: nuevoUsuario.conjuntoId,
      tenantId: nuevoUsuario.conjunto?.tenantId,
      nombreCompleto: nuevoUsuario.nombreCompleto,
      activo: nuevoUsuario.activo,
      emailVerificado: nuevoUsuario.emailVerificado,
    };

    // Generar tokens para auto-login después del registro
    const tokens = generateAuthTokens(authUser);

    // Crear respuesta con cookies
    const response = NextResponse.json(
      createAuthSuccessResponse(
        authUser, 
        tokens, 
        'Registro exitoso. Por favor verifica tu email.'
      )
    );

    // Configurar cookies
    response.cookies.set('auth-token', tokens.accessToken, AUTH_CONSTANTS.COOKIE_OPTIONS);
    response.cookies.set('refresh-token', tokens.refreshToken, {
      ...AUTH_CONSTANTS.COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return response;

  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejar errores específicos de base de datos
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          createAuthErrorResponse('El email ya está registrado'),
          { status: 409 }
        );
      }
    }

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
