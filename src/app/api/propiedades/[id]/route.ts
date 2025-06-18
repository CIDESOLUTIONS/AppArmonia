import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { propiedadSchema } from '@/lib/validations';
import { z } from 'zod';

interface Props {
  params: {
    id: string;
  };
}

/**
 * GET /api/propiedades/[id]
 * Obtiene una propiedad específica por ID
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

    const propiedad = await prisma.propiedad.findUnique({
      where: { id },
      include: {
        propietarios: {
          where: { estado: 'ACTIVO' },
          include: {
            usuario: {
              select: {
                id: true,
                email: true,
                fechaUltimoAcceso: true,
                estado: true,
              }
            }
          }
        },
        residentes: {
          where: { estado: 'ACTIVO' },
          orderBy: [
            { parentesco: 'asc' },
            { nombre: 'asc' }
          ]
        },
        vehiculos: {
          where: { estado: 'ACTIVO' },
          orderBy: { placa: 'asc' }
        },
        mascotas: {
          where: { estado: 'ACTIVO' },
          orderBy: { nombre: 'asc' }
        },
        cuotas: {
          orderBy: { fechaVencimiento: 'desc' },
          take: 5,
          select: {
            id: true,
            tipo: true,
            monto: true,
            fechaVencimiento: true,
            estado: true,
          }
        },
        pqrs: {
          orderBy: { fechaCreacion: 'desc' },
          take: 5,
          select: {
            id: true,
            tipo: true,
            asunto: true,
            estado: true,
            fechaCreacion: true,
          }
        }
      }
    });

    if (!propiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: propiedad
    });

  } catch (error) {
    console.error(`Error en GET /api/propiedades/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/propiedades/[id]
 * Actualiza una propiedad específica
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos de administrador
    if (!['SUPER_ADMIN', 'ADMIN_CONJUNTO'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Crear esquema de actualización (campos opcionales)
    const updateSchema = propiedadSchema.partial();
    const validatedData = updateSchema.parse(body);

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Verificar que la propiedad existe
    const existingPropiedad = await prisma.propiedad.findUnique({
      where: { id }
    });

    if (!existingPropiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    // Si se está actualizando número o torre, verificar que no haya duplicados
    if (validatedData.numero || validatedData.torre !== undefined) {
      const numero = validatedData.numero || existingPropiedad.numero;
      const torre = validatedData.torre !== undefined ? validatedData.torre : existingPropiedad.torre;
      
      const duplicatePropiedad = await prisma.propiedad.findFirst({
        where: {
          numero,
          torre,
          id: { not: id }
        }
      });

      if (duplicatePropiedad) {
        return NextResponse.json(
          { error: 'Ya existe otra propiedad con ese número en la torre especificada' },
          { status: 400 }
        );
      }
    }

    // Actualizar la propiedad
    const propiedadActualizada = await prisma.propiedad.update({
      where: { id },
      data: {
        ...validatedData,
        actualizadoPor: session.user.id,
        fechaActualizacion: new Date(),
      },
      include: {
        propietarios: {
          where: { estado: 'ACTIVO' },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          }
        },
        residentes: {
          where: { estado: 'ACTIVO' },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            parentesco: true,
          }
        },
        _count: {
          select: {
            propietarios: true,
            residentes: true,
            vehiculos: true,
            mascotas: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Propiedad actualizada exitosamente',
      data: propiedadActualizada
    });

  } catch (error) {
    console.error(`Error en PUT /api/propiedades/${params.id}:`, error);
    
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
 * DELETE /api/propiedades/[id]
 * Elimina una propiedad (soft delete)
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

    // Verificar que la propiedad existe
    const existingPropiedad = await prisma.propiedad.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            propietarios: true,
            residentes: true,
            cuotas: true,
            pqrs: true,
          }
        }
      }
    });

    if (!existingPropiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si tiene dependencias activas
    const hasActiveDependencies = 
      existingPropiedad._count.propietarios > 0 ||
      existingPropiedad._count.residentes > 0 ||
      existingPropiedad._count.cuotas > 0 ||
      existingPropiedad._count.pqrs > 0;

    if (hasActiveDependencies) {
      return NextResponse.json(
        { error: 'No se puede eliminar la propiedad porque tiene registros asociados activos' },
        { status: 400 }
      );
    }

    // Soft delete: marcar como eliminada
    await prisma.propiedad.update({
      where: { id },
      data: {
        estado: 'EN_MANTENIMIENTO', // Usar estado existente como "eliminado"
        observaciones: `ELIMINADA - ${new Date().toISOString()} - ${session.user.email}`,
        actualizadoPor: session.user.id,
        fechaActualizacion: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Propiedad eliminada exitosamente'
    });

  } catch (error) {
    console.error(`Error en DELETE /api/propiedades/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
