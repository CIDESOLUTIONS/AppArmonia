/**
 * Endpoint de Recuperación de Contraseña - POST /api/auth/forgot-password
 * Envía email con token para reseteo de contraseña
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  generatePasswordResetToken,
  createAuthSuccessResponse,
  createAuthErrorResponse 
} from '@/lib/auth';
import { forgotPasswordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        createAuthErrorResponse(
          'Datos de entrada inválidos',
          validationResult.error.errors[0]?.message
        ),
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
        activo: true,
      }
    });

    // Por seguridad, siempre respondemos éxito, incluso si el email no existe
    const successResponse = NextResponse.json(
      createAuthSuccessResponse(
        {} as any,
        {} as any,
        'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
      )
    );

    if (!usuario) {
      console.log(`Intento de recuperación para email no registrado: ${email}`);
      return successResponse;
    }

    if (!usuario.activo) {
      console.log(`Intento de recuperación para cuenta desactivada: ${email}`);
      return successResponse;
    }

    // Generar token de recuperación
    const resetToken = generatePasswordResetToken(usuario.id, usuario.email);

    // Guardar token en base de datos con expiración
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1); // 1 hora de expiración

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tokenRecuperacion: resetToken,
        tokenExpiracion: expiracion,
      }
    });

    // En producción, aquí se enviaría el email
    // await sendPasswordResetEmail(usuario.email, resetToken, usuario.nombreCompleto);

    // Por ahora, loguear el token para desarrollo
    console.log(`🔐 Token de recuperación para ${usuario.email}: ${resetToken}`);
    console.log(`🔗 URL de recuperación: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`);

    // Log de auditoría
    console.log(`📧 Solicitud de recuperación de contraseña enviada a: ${usuario.email}`);

    return successResponse;

  } catch (error) {
    console.error('Error en forgot password:', error);
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
