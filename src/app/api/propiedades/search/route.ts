import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { z } from 'zod';

// Schema para validar parámetros de búsqueda avanzada
const searchSchema = z.object({
  query: z.string().optional(),
  tipo: z.array(z.string()).optional(),
  estado: z.array(z.string()).optional(),
  torre: z.array(z.string()).optional(),
  pisoMin: z.number().min(0).optional(),
  pisoMax: z.number().min(0).optional(),
  areaMin: z.number().min(0).optional(),
  areaMax: z.number().min(0).optional(),
  habitacionesMin: z.number().min(0).optional(),
  habitacionesMax: z.number().min(0).optional(),
  banosMin: z.number().min(0).optional(),
  banosMax: z.number().min(0).optional(),
  conPropietario: z.boolean().optional(),
  conResidentes: z.boolean().optional(),
  conVehiculos: z.boolean().optional(),
  conMascotas: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['numero', 'torre', 'tipo', 'estado', 'area', 'fechaCreacion']).default('numero'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * POST /api/propiedades/search
 * Búsqueda avanzada de propiedades con múltiples filtros
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedParams = searchSchema.parse(body);

    const {
      query,
      tipo,
      estado,
      torre,
      pisoMin,
      pisoMax,
      areaMin,
      areaMax,
      habitacionesMin,
      habitacionesMax,
      banosMin,
      banosMax,
      conPropietario,
      conResidentes,
      conVehiculos,
      conMascotas,
      page,
      limit,
      sortBy,
      sortOrder
    } = validatedParams;

    const offset = (page - 1) * limit;

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Construir filtros WHERE
    const where: any = {};

    // Búsqueda por texto en múltiples campos
    if (query) {
      where.OR = [
        { numero: { contains: query, mode: 'insensitive' } },
        { torre: { contains: query, mode: 'insensitive' } },
        { observaciones: { contains: query, mode: 'insensitive' } },
        {
          propietarios: {
            some: {
              OR: [
                { nombre: { contains: query, mode: 'insensitive' } },
                { apellido: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ]
            }
          }
        },
        {
          residentes: {
            some: {
              OR: [
                { nombre: { contains: query, mode: 'insensitive' } },
                { apellido: { contains: query, mode: 'insensitive' } },
              ]
            }
          }
        }
      ];
    }

    // Filtros específicos
    if (tipo && tipo.length > 0) {
      where.tipo = { in: tipo };
    }

    if (estado && estado.length > 0) {
      where.estado = { in: estado };
    }

    if (torre && torre.length > 0) {
      where.torre = { in: torre };
    }

    // Filtros de rango numérico
    if (pisoMin !== undefined || pisoMax !== undefined) {
      where.piso = {};
      if (pisoMin !== undefined) where.piso.gte = pisoMin;
      if (pisoMax !== undefined) where.piso.lte = pisoMax;
    }

    if (areaMin !== undefined || areaMax !== undefined) {
      where.area = {};
      if (areaMin !== undefined) where.area.gte = areaMin;
      if (areaMax !== undefined) where.area.lte = areaMax;
    }

    if (habitacionesMin !== undefined || habitacionesMax !== undefined) {
      where.habitaciones = {};
      if (habitacionesMin !== undefined) where.habitaciones.gte = habitacionesMin;
      if (habitacionesMax !== undefined) where.habitaciones.lte = habitacionesMax;
    }

    if (banosMin !== undefined || banosMax !== undefined) {
      where.banos = {};
      if (banosMin !== undefined) where.banos.gte = banosMin;
      if (banosMax !== undefined) where.banos.lte = banosMax;
    }

    // Filtros de relaciones
    if (conPropietario !== undefined) {
      if (conPropietario) {
        where.propietarios = { some: { estado: 'ACTIVO' } };
      } else {
        where.propietarios = { none: { estado: 'ACTIVO' } };
      }
    }

    if (conResidentes !== undefined) {
      if (conResidentes) {
        where.residentes = { some: { estado: 'ACTIVO' } };
      } else {
        where.residentes = { none: { estado: 'ACTIVO' } };
      }
    }

    if (conVehiculos !== undefined) {
      if (conVehiculos) {
        where.vehiculos = { some: { estado: 'ACTIVO' } };
      } else {
        where.vehiculos = { none: { estado: 'ACTIVO' } };
      }
    }

    if (conMascotas !== undefined) {
      if (conMascotas) {
        where.mascotas = { some: { estado: 'ACTIVO' } };
      } else {
        where.mascotas = { none: { estado: 'ACTIVO' } };
      }
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    if (sortBy === 'fechaCreacion') {
      orderBy.fechaCreacion = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Ejecutar consultas
    const [propiedades, total] = await Promise.all([
      prisma.propiedad.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy,
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
          mascotas: {
            where: { estado: 'ACTIVO' },
            select: {
              id: true,
              nombre: true,
              especie: true,
              raza: true,
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

    // Obtener valores únicos para filtros (útil para frontend)
    const [tiposDisponibles, estadosDisponibles, torresDisponibles] = await Promise.all([
      prisma.propiedad.findMany({
        select: { tipo: true },
        distinct: ['tipo'],
        orderBy: { tipo: 'asc' }
      }),
      prisma.propiedad.findMany({
        select: { estado: true },
        distinct: ['estado'],
        orderBy: { estado: 'asc' }
      }),
      prisma.propiedad.findMany({
        select: { torre: true },
        distinct: ['torre'],
        orderBy: { torre: 'asc' },
        where: { torre: { not: null } }
      })
    ]);

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
      },
      filters: {
        tipos: tiposDisponibles.map(t => t.tipo),
        estados: estadosDisponibles.map(e => e.estado),
        torres: torresDisponibles.map(t => t.torre).filter(Boolean),
      },
      searchParams: validatedParams
    });

  } catch (error) {
    console.error('Error en POST /api/propiedades/search:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Parámetros de búsqueda inválidos',
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
 * GET /api/propiedades/search
 * Búsqueda simple por query string (para compatibilidad)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Redirigir a búsqueda POST con parámetros básicos
    const searchData = {
      query,
      page,
      limit
    };

    // Usar el mismo handler de POST
    const mockRequest = {
      json: async () => searchData
    } as NextRequest;

    return await POST(mockRequest);

  } catch (error) {
    console.error('Error en GET /api/propiedades/search:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
