import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { propietarioSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/propietarios
 * Lista todos los propietarios del conjunto residencial
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
    const estado = searchParams.get('estado');
    const tipoDocumento = searchParams.get('tipoDocumento');

    const offset = (page - 1) * limit;

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { numeroDocumento: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (estado) where.estado = estado;
    if (tipoDocumento) where.tipoDocumento = tipoDocumento;

    // Ejecutar consultas
    const [propietarios, total] = await Promise.all([
      prisma.propietario.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: [
          { apellido: 'asc' },
          { nombre: 'asc' }
        ],
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
      }),
      prisma.propietario.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: propietarios,
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
    console.error('Error en GET /api/propietarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/propietarios
 * Crea un nuevo propietario
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
    const validatedData = propietarioSchema.parse(body);

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Verificar que no exista otro propietario con el mismo documento
    const existingPropietario = await prisma.propietario.findFirst({
      where: {
        numeroDocumento: validatedData.numeroDocumento,
        tipoDocumento: validatedData.tipoDocumento,
      }
    });

    if (existingPropietario) {
      return NextResponse.json(
        { error: 'Ya existe un propietario con ese número de documento' },
        { status: 400 }
      );
    }

    // Verificar que no exista otro propietario con el mismo email
    const existingEmail = await prisma.propietario.findFirst({
      where: {
        email: validatedData.email,
      }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Ya existe un propietario con ese email' },
        { status: 400 }
      );
    }

    // Crear el propietario
    const nuevoPropietario = await prisma.propietario.create({
      data: {
        ...validatedData,
        creadoPor: session.user.id,
        actualizadoPor: session.user.id,
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
      message: 'Propietario creado exitosamente',
      data: nuevoPropietario
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/propietarios:', error);
    
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
