import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

/**
 * GET /api/propiedades/stats
 * Obtiene estadísticas generales de propiedades
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos de administrador
    if (!['SUPER_ADMIN', 'ADMIN_CONJUNTO'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    // Obtener cliente Prisma para el tenant del usuario
    const prisma = await getPrismaClient(session.user.tenantId);

    // Ejecutar consultas en paralelo para mejor performance
    const [
      totalPropiedades,
      propiedadesPorTipo,
      propiedadesPorEstado,
      propiedadesPorTorre,
      propiedadesConPropietarios,
      propiedadesConResidentes,
      totalVehiculos,
      totalMascotas,
      estadisticasGenerales
    ] = await Promise.all([
      // Total de propiedades
      prisma.propiedad.count(),

      // Propiedades por tipo
      prisma.propiedad.groupBy({
        by: ['tipo'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),

      // Propiedades por estado
      prisma.propiedad.groupBy({
        by: ['estado'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),

      // Propiedades por torre
      prisma.propiedad.groupBy({
        by: ['torre'],
        _count: {
          id: true
        },
        orderBy: {
          torre: 'asc'
        }
      }),

      // Propiedades con propietarios
      prisma.propiedad.count({
        where: {
          propietarios: {
            some: {
              estado: 'ACTIVO'
            }
          }
        }
      }),

      // Propiedades con residentes
      prisma.propiedad.count({
        where: {
          residentes: {
            some: {
              estado: 'ACTIVO'
            }
          }
        }
      }),

      // Total de vehículos
      prisma.vehiculo.count({
        where: {
          estado: 'ACTIVO'
        }
      }),

      // Total de mascotas
      prisma.mascota.count({
        where: {
          estado: 'ACTIVO'
        }
      }),

      // Estadísticas generales
      prisma.propiedad.aggregate({
        _avg: {
          area: true,
          habitaciones: true,
          banos: true,
          parqueaderos: true,
          coeficiente: true
        },
        _sum: {
          area: true,
          parqueaderos: true,
          depositos: true
        },
        _max: {
          piso: true
        }
      })
    ]);

    // Calcular métricas adicionales
    const ocupacion = {
      total: totalPropiedades,
      conPropietarios: propiedadesConPropietarios,
      conResidentes: propiedadesConResidentes,
      desocupadas: totalPropiedades - propiedadesConResidentes,
      porcentajeOcupacion: totalPropiedades > 0 
        ? Math.round((propiedadesConResidentes / totalPropiedades) * 100) 
        : 0
    };

    const distribucion = {
      porTipo: propiedadesPorTipo.map(item => ({
        tipo: item.tipo,
        cantidad: item._count.id,
        porcentaje: totalPropiedades > 0 
          ? Math.round((item._count.id / totalPropiedades) * 100) 
          : 0
      })),
      porEstado: propiedadesPorEstado.map(item => ({
        estado: item.estado,
        cantidad: item._count.id,
        porcentaje: totalPropiedades > 0 
          ? Math.round((item._count.id / totalPropiedades) * 100) 
          : 0
      })),
      porTorre: propiedadesPorTorre.map(item => ({
        torre: item.torre || 'Sin torre',
        cantidad: item._count.id,
        porcentaje: totalPropiedades > 0 
          ? Math.round((item._count.id / totalPropiedades) * 100) 
          : 0
      }))
    };

    const promedios = {
      areaPorPropiedad: estadisticasGenerales._avg.area ? 
        Math.round(estadisticasGenerales._avg.area * 100) / 100 : 0,
      habitacionesPorPropiedad: estadisticasGenerales._avg.habitaciones ? 
        Math.round(estadisticasGenerales._avg.habitaciones * 100) / 100 : 0,
      banosPorPropiedad: estadisticasGenerales._avg.banos ? 
        Math.round(estadisticasGenerales._avg.banos * 100) / 100 : 0,
      parqueaderosPorPropiedad: estadisticasGenerales._avg.parqueaderos ? 
        Math.round(estadisticasGenerales._avg.parqueaderos * 100) / 100 : 0,
      coeficientePromedio: estadisticasGenerales._avg.coeficiente ? 
        Math.round(estadisticasGenerales._avg.coeficiente * 10000) / 10000 : 0,
    };

    const totales = {
      areaTotal: estadisticasGenerales._sum.area || 0,
      parqueaderosTotal: estadisticasGenerales._sum.parqueaderos || 0,
      depositosTotal: estadisticasGenerales._sum.depositos || 0,
      pisosMaximo: estadisticasGenerales._max.piso || 0,
      vehiculosTotal: totalVehiculos,
      mascotasTotal: totalMascotas,
    };

    return NextResponse.json({
      success: true,
      data: {
        resumen: {
          totalPropiedades,
          ...ocupacion,
          vehiculosRegistrados: totalVehiculos,
          mascotasRegistradas: totalMascotas,
        },
        distribucion,
        promedios,
        totales,
        fechaActualizacion: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error en GET /api/propiedades/stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
