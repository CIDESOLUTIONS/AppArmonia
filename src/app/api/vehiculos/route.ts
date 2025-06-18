import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { vehiculoSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/vehiculos
 * Lista todos los vehículos del conjunto residencial
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const propiedadId = searchParams.get('propiedadId');
    const tipo = searchParams.get('tipo');

    const offset = (page - 1) * limit;

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Construir filtros
    const where: any = { estado: 'ACTIVO' };
    
    if (search) {
      where.OR = [
        { placa: { contains: search, mode: 'insensitive' } },
        { marca: { contains: search, mode: 'insensitive' } },
        { modelo: { contains: search, mode: 'insensitive' } },
        {
          propiedad: {
            numero: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }
    
    if (propiedadId) where.propiedadId = propiedadId;
    if (tipo) where.tipo = tipo;

    // Ejecutar consultas
    const [vehiculos, total] = await Promise.all([
      prisma.vehiculo.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: [
          { placa: 'asc' }
        ],
        include: {
          propiedad: {
            select: {
              id: true,
              numero: true,
              torre: true,
              tipo: true,
            }
          }
        }
      }),
      prisma.vehiculo.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: vehiculos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });

  } catch (error) {
    console.error('Error en GET /api/vehiculos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vehiculos
 * Registra un nuevo vehículo
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    const isAdmin = ['SUPER_ADMIN', 'ADMIN_CONJUNTO'].includes(session.user.role);
    const isOwner = ['PROPIETARIO'].includes(session.user.role);

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = vehiculoSchema.parse(body);

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Verificar que la propiedad existe
    const propiedad = await prisma.propiedad.findUnique({
      where: { id: validatedData.propiedadId }
    });

    if (!propiedad) {
      return NextResponse.json(
        { error: 'La propiedad especificada no existe' },
        { status: 400 }
      );
    }

    // Verificar que no exista otro vehículo con la misma placa
    const existingVehiculo = await prisma.vehiculo.findFirst({
      where: {
        placa: validatedData.placa,
        estado: 'ACTIVO',
      }
    });

    if (existingVehiculo) {
      return NextResponse.json(
        { error: 'Ya existe un vehículo registrado con esa placa' },
        { status: 400 }
      );
    }

    // Crear el vehículo
    const nuevoVehiculo = await prisma.vehiculo.create({
      data: {
        ...validatedData,
        creadoPor: session.user.id,
        actualizadoPor: session.user.id,
      },
      include: {
        propiedad: {
          select: {
            id: true,
            numero: true,
            torre: true,
            tipo: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Vehículo registrado exitosamente',
      data: nuevoVehiculo
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/vehiculos:', error);
    
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
