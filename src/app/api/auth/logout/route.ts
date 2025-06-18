/**
 * Endpoint de Logout - POST /api/auth/logout
 * Cierre de sesión y limpieza de tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthSuccessResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Crear respuesta de logout exitoso
    const response = NextResponse.json(
      createAuthSuccessResponse(
        {} as any, // No se necesitan datos de usuario
        {} as any, // No se necesitan tokens
        'Sesión cerrada exitosamente'
      )
    );

    // Limpiar cookies de autenticación
    response.cookies.delete('auth-token');
    response.cookies.delete('refresh-token');

    // Alternativamente, establecer cookies expiradas
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expira inmediatamente
      path: '/',
    });

    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expira inmediatamente
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error en logout:', error);
    
    // Incluso si hay error, limpiar cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'Sesión cerrada (con errores menores)',
      }
    );

    response.cookies.delete('auth-token');
    response.cookies.delete('refresh-token');

    return response;
  }
}

// Método GET para logout via URL (opcional)
export async function GET(request: NextRequest) {
  return POST(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
