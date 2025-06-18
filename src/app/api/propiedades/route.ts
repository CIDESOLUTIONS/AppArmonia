import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { propiedadSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/propiedades
 * Lista todas las propiedades del conjunto residencial
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
    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const torre = searchParams.get('torre');

    const offset = (page - 1) * limit;

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { numero: { contains: search, mode: 'insensitive' } },
        { torre: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (torre) where.torre = torre;

    // Ejecutar consultas
    const [propiedades, total] = await Promise.all([
      prisma.propiedad.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: [
          { torre: 'asc' },
          { numero: 'asc' }
        ],
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
          _count: {
            select: {
              propietarios: true,
              residentes: true,
              vehiculos: true,
              mascotas: true,
            }
          }
        }
      }),
      prisma.propiedad.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: propiedades,
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
    console.error('Error en GET /api/propiedades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/propiedades
 * Crea una nueva propiedad
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos de administrador
    if (!['SUPER_ADMIN', 'ADMIN_CONJUNTO'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = propiedadSchema.parse(body);

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Verificar que no exista otra propiedad con el mismo número en la misma torre
    const existingPropiedad = await prisma.propiedad.findFirst({
      where: {
        numero: validatedData.numero,
        torre: validatedData.torre || null,
      }
    });

    if (existingPropiedad) {
      return NextResponse.json(
        { error: 'Ya existe una propiedad con ese número en la torre especificada' },
        { status: 400 }
      );
    }

    // Crear la propiedad
    const nuevaPropiedad = await prisma.propiedad.create({
      data: {
        ...validatedData,
        creadoPor: session.user.id,
        actualizadoPor: session.user.id,
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
      message: 'Propiedad creada exitosamente',
      data: nuevaPropiedad
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/propiedades:', error);
    
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
