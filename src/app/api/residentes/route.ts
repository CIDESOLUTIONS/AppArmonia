import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { residenteSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/residentes
 * Lista todos los residentes del conjunto residencial
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
    const propiedadId = searchParams.get('propiedadId');
    const parentesco = searchParams.get('parentesco');

    const offset = (page - 1) * limit;

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { numeroDocumento: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
        {
          propiedad: {
            numero: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }
    
    if (estado) where.estado = estado;
    if (propiedadId) where.propiedadId = propiedadId;
    if (parentesco) where.parentesco = parentesco;

    // Ejecutar consultas
    const [residentes, total] = await Promise.all([
      prisma.residente.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: [
          { apellido: 'asc' },
          { nombre: 'asc' }
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
      prisma.residente.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: residentes,
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
    console.error('Error en GET /api/residentes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/residentes
 * Crea un nuevo residente
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
    const validatedData = residenteSchema.parse(body);

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

    // Verificar que no exista otro residente activo con el mismo documento
    const existingResidente = await prisma.residente.findFirst({
      where: {
        numeroDocumento: validatedData.numeroDocumento,
        tipoDocumento: validatedData.tipoDocumento,
        estado: 'ACTIVO',
      }
    });

    if (existingResidente) {
      return NextResponse.json(
        { error: 'Ya existe un residente activo con ese número de documento' },
        { status: 400 }
      );
    }

    // Crear el residente
    const nuevoResidente = await prisma.residente.create({
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
      message: 'Residente creado exitosamente',
      data: nuevoResidente
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/residentes:', error);
    
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
