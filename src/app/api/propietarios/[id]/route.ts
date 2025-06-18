import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { propietarioSchema } from '@/lib/validations';
import { z } from 'zod';

interface Props {
  params: {
    id: string;
  };
}

/**
 * GET /api/propietarios/[id]
 * Obtiene un propietario específico por ID
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    const propietario = await prisma.propietario.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            fechaUltimoAcceso: true,
            estado: true,
            rol: true,
          }
        },
        propiedades: {
          include: {
            residentes: {
              where: { estado: 'ACTIVO' },
              select: {
                id: true,
                nombre: true,
                apellido: true,
                parentesco: true,
              }
            },
            vehiculos: {
              where: { estado: 'ACTIVO' },
              select: {
                id: true,
                placa: true,
                tipo: true,
                marca: true,
                modelo: true,
              }
            },
            mascotas: {
              where: { estado: 'ACTIVO' },
              select: {
                id: true,
                nombre: true,
                especie: true,
                raza: true,
              }
            }
          }
        },
      }
    });

    if (!propietario) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: propietario
    });

  } catch (error) {
    console.error(`Error en GET /api/propietarios/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/propietarios/[id]
 * Actualiza un propietario específico
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    const isAdmin = ['SUPER_ADMIN', 'ADMIN_CONJUNTO'].includes(session.user.role);
    const isOwnProfile = session.user.id === params.id;

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Crear esquema de actualización (campos opcionales)
    const updateSchema = propietarioSchema.partial();
    const validatedData = updateSchema.parse(body);

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Verificar que el propietario existe
    const existingPropietario = await prisma.propietario.findUnique({
      where: { id }
    });

    if (!existingPropietario) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      );
    }

    // Si se está actualizando documento, verificar que no haya duplicados
    if (validatedData.numeroDocumento || validatedData.tipoDocumento) {
      const numeroDocumento = validatedData.numeroDocumento || existingPropietario.numeroDocumento;
      const tipoDocumento = validatedData.tipoDocumento || existingPropietario.tipoDocumento;
      
      const duplicateDocumento = await prisma.propietario.findFirst({
        where: {
          numeroDocumento,
          tipoDocumento,
          id: { not: id }
        }
      });

      if (duplicateDocumento) {
        return NextResponse.json(
          { error: 'Ya existe otro propietario con ese número de documento' },
          { status: 400 }
        );
      }
    }

    // Si se está actualizando email, verificar que no haya duplicados
    if (validatedData.email) {
      const duplicateEmail = await prisma.propietario.findFirst({
        where: {
          email: validatedData.email,
          id: { not: id }
        }
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Ya existe otro propietario con ese email' },
          { status: 400 }
        );
      }
    }

    // Actualizar el propietario
    const propietarioActualizado = await prisma.propietario.update({
      where: { id },
      data: {
        ...validatedData,
        actualizadoPor: session.user.id,
        fechaActualizacion: new Date(),
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            fechaUltimoAcceso: true,
            estado: true,
          }
        },
        propiedades: {
          select: {
            id: true,
            numero: true,
            torre: true,
            tipo: true,
            estado: true,
          }
        },
        _count: {
          select: {
            propiedades: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Propietario actualizado exitosamente',
      data: propietarioActualizado
    });

  } catch (error) {
    console.error(`Error en PUT /api/propietarios/${params.id}:`, error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Datos de entrada inválidos',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/propietarios/[id]
 * Elimina un propietario (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos de super admin únicamente
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { id } = params;

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Verificar que el propietario existe
    const existingPropietario = await prisma.propietario.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            propiedades: true,
          }
        }
      }
    });

    if (!existingPropietario) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si tiene propiedades asociadas
    if (existingPropietario._count.propiedades > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el propietario porque tiene propiedades asociadas' },
        { status: 400 }
      );
    }

    // Soft delete: marcar como inactivo
    await prisma.propietario.update({
      where: { id },
      data: {
        estado: 'INACTIVO',
        actualizadoPor: session.user.id,
        fechaActualizacion: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Propietario eliminado exitosamente'
    });

  } catch (error) {
    console.error(`Error en DELETE /api/propietarios/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
