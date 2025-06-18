/**
 * Endpoint de Reset de Contraseña - POST /api/auth/reset-password
 * Resetea la contraseña usando el token de recuperación
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  verifyPasswordResetToken,
  hashPassword,
  createAuthSuccessResponse,
  createAuthErrorResponse 
} from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        createAuthErrorResponse(
          'Datos de entrada inválidos',
          validationResult.error.errors[0]?.message
        ),
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    // Verificar token JWT
    const tokenPayload = verifyPasswordResetToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        createAuthErrorResponse('Token inválido o expirado'),
        { status: 400 }
      );
    }

    // Buscar usuario con el token
    const usuario = await prisma.usuario.findFirst({
      where: {
        id: tokenPayload.userId,
        email: tokenPayload.email,
        tokenRecuperacion: token,
        tokenExpiracion: {
          gte: new Date(), // Token no expirado
        },
        activo: true,
      },
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
      }
    });

    if (!usuario) {
      return NextResponse.json(
        createAuthErrorResponse('Token inválido, expirado o usuario no encontrado'),
        { status: 400 }
      );
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(password);

    // Actualizar contraseña y limpiar token de recuperación
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: hashedPassword,
        tokenRecuperacion: null,
        tokenExpiracion: null,
        // Opcional: forzar verificación de email si no está verificado
        // emailVerificado: true,
      }
    });

    // Log de auditoría
    console.log(`🔒 Contraseña restablecida exitosamente para: ${usuario.email}`);

    return NextResponse.json(
      createAuthSuccessResponse(
        {} as any,
        {} as any,
        'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.'
      )
    );

  } catch (error) {
    console.error('Error en reset password:', error);
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
