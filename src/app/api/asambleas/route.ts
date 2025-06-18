import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation Schemas
const AsambleaEstado = z.enum(['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'])
const TipoAsamblea = z.enum(['ORDINARIA', 'EXTRAORDINARIA', 'EMERGENCIA'])

const createAsambleaSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  tipo: TipoAsamblea,
  fechaHora: z.string().refine((date) => new Date(date) > new Date(), 'La fecha debe ser futura'),
  lugar: z.string().min(3, 'El lugar debe tener al menos 3 caracteres'),
  duracionEstimada: z.number().min(30).max(480), // Entre 30 minutos y 8 horas
  quorumMinimo: z.number().min(1).max(100), // Porcentaje
  ordenDelDia: z.array(z.object({
    titulo: z.string().min(3, 'El título del punto debe tener al menos 3 caracteres'),
    descripcion: z.string().optional(),
    tiempoEstimado: z.number().min(5).max(120).optional(), // minutos
    responsable: z.string().optional()
  })).min(1, 'Debe haber al menos un punto en el orden del día'),
  convocatoriaDias: z.number().min(1).max(30).default(8), // Días de anticipación
  documentosAdjuntos: z.array(z.string()).optional()
})

const updateAsambleaSchema = z.object({
  titulo: z.string().min(5).max(200).optional(),
  descripcion: z.string().min(10).optional(),
  fechaHora: z.string().optional(),
  lugar: z.string().min(3).optional(),
  duracionEstimada: z.number().min(30).max(480).optional(),
  quorumMinimo: z.number().min(1).max(100).optional(),
  estado: AsambleaEstado.optional(),
  ordenDelDia: z.array(z.object({
    titulo: z.string().min(3),
    descripcion: z.string().optional(),
    tiempoEstimado: z.number().min(5).max(120).optional(),
    responsable: z.string().optional()
  })).optional(),
  actaResumen: z.string().optional(),
  observaciones: z.string().optional()
})

// Interfaces
interface PuntoOrdenDelDia {
  titulo: string
  descripcion?: string
  tiempoEstimado?: number
  responsable?: string
}

interface Asamblea {
  id: string
  titulo: string
  descripcion: string
  tipo: string
  fechaHora: string
  lugar: string
  duracionEstimada: number
  quorumMinimo: number
  estado: string
  fechaCreacion: string
  fechaConvocatoria?: string
  fechaInicio?: string
  fechaFin?: string
  ordenDelDia: PuntoOrdenDelDia[]
  convocatoriaDias: number
  documentosAdjuntos?: string[]
  actaResumen?: string
  observaciones?: string
  asistentes: {
    confirmados: number
    presentes: number
    ausentes: number
    delegaciones: number
  }
  quorumAlcanzado: boolean
  creadorId: string
}

// Simulated database
let asambleasDatabase: Asamblea[] = [
  {
    id: '1',
    titulo: 'Asamblea Ordinaria - Junio 2024',
    descripcion: 'Asamblea ordinaria para revisar estados financieros y aprobar presupuesto para mejoras.',
    tipo: 'ORDINARIA',
    fechaHora: '2024-06-25T19:00:00Z',
    lugar: 'Salón Social - Piso 1',
    duracionEstimada: 120,
    quorumMinimo: 51,
    estado: 'PROGRAMADA',
    fechaCreacion: '2024-06-01T10:00:00Z',
    fechaConvocatoria: '2024-06-17T09:00:00Z',
    ordenDelDia: [
      {
        titulo: 'Verificación de quórum',
        descripcion: 'Confirmación de asistencia y representaciones',
        tiempoEstimado: 10
      },
      {
        titulo: 'Informe financiero del período',
        descripcion: 'Presentación de estados financieros y ejecución presupuestal',
        tiempoEstimado: 30,
        responsable: 'Administrador'
      },
      {
        titulo: 'Propuesta de mejoras en áreas comunes',
        descripcion: 'Evaluación y votación de propuestas para mejoras en piscina y gimnasio',
        tiempoEstimado: 45,
        responsable: 'Comité de Mejoras'
      },
      {
        titulo: 'Proposiciones y varios',
        descripcion: 'Espacio para proposiciones de los propietarios',
        tiempoEstimado: 35
      }
    ],
    convocatoriaDias: 8,
    documentosAdjuntos: ['estados-financieros-mayo.pdf', 'propuesta-mejoras-piscina.pdf'],
    asistentes: {
      confirmados: 45,
      presentes: 0,
      ausentes: 0,
      delegaciones: 3
    },
    quorumAlcanzado: false,
    creadorId: 'admin-1'
  },
  {
    id: '2',
    titulo: 'Asamblea Extraordinaria - Seguridad',
    descripcion: 'Asamblea extraordinaria para tratar temas urgentes de seguridad del conjunto.',
    tipo: 'EXTRAORDINARIA',
    fechaHora: '2024-05-20T18:00:00Z',
    lugar: 'Salón Social - Piso 1',
    duracionEstimada: 90,
    quorumMinimo: 51,
    estado: 'FINALIZADA',
    fechaCreacion: '2024-05-10T14:00:00Z',
    fechaConvocatoria: '2024-05-12T10:00:00Z',
    fechaInicio: '2024-05-20T18:15:00Z',
    fechaFin: '2024-05-20T19:45:00Z',
    ordenDelDia: [
      {
        titulo: 'Verificación de quórum',
        tiempoEstimado: 10
      },
      {
        titulo: 'Informe sobre incidentes de seguridad',
        descripcion: 'Reporte detallado de eventos ocurridos en el último mes',
        tiempoEstimado: 25,
        responsable: 'Jefe de Seguridad'
      },
      {
        titulo: 'Propuesta de mejoras en seguridad',
        descripcion: 'Instalación de cámaras adicionales y refuerzo de portería',
        tiempoEstimado: 40,
        responsable: 'Administrador'
      },
      {
        titulo: 'Aprobación de presupuesto extraordinario',
        tiempoEstimado: 15
      }
    ],
    convocatoriaDias: 8,
    documentosAdjuntos: ['informe-seguridad-abril.pdf', 'cotizacion-camaras.pdf'],
    actaResumen: 'Se aprobó por mayoría la instalación de 4 cámaras adicionales en áreas comunes y el refuerzo del servicio de portería. Presupuesto aprobado: $8,500,000. Inicio de obras: 1 de junio.',
    asistentes: {
      confirmados: 52,
      presentes: 48,
      ausentes: 4,
      delegaciones: 6
    },
    quorumAlcanzado: true,
    creadorId: 'admin-1'
  }
]

// Utility functions
function calculateQuorum(totalPropietarios: number, presentes: number, delegaciones: number): boolean {
  const totalVotos = presentes + delegaciones
  const porcentajeAsistencia = (totalVotos / totalPropietarios) * 100
  return porcentajeAsistencia >= 51 // Quórum mínimo del 51%
}

function canStartAsamblea(asamblea: Asamblea): boolean {
  const now = new Date()
  const fechaAsamblea = new Date(asamblea.fechaHora)
  const tiempoAntes = fechaAsamblea.getTime() - now.getTime()
  
  // Permitir iniciar 15 minutos antes de la hora programada
  return tiempoAntes <= 15 * 60 * 1000 && asamblea.estado === 'PROGRAMADA'
}

function shouldSendConvocatoria(asamblea: Asamblea): boolean {
  const now = new Date()
  const fechaAsamblea = new Date(asamblea.fechaHora)
  const diasDiferencia = (fechaAsamblea.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  
  return diasDiferencia <= asamblea.convocatoriaDias && !asamblea.fechaConvocatoria
}

// GET - List asambleas with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Filters
    const estado = searchParams.get('estado')
    const tipo = searchParams.get('tipo')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')
    const search = searchParams.get('search')
    
    // Apply filters
    let filteredAsambleas = asambleasDatabase
    
    if (estado) {
      filteredAsambleas = filteredAsambleas.filter(a => a.estado === estado)
    }
    
    if (tipo) {
      filteredAsambleas = filteredAsambleas.filter(a => a.tipo === tipo)
    }
    
    if (fechaDesde) {
      filteredAsambleas = filteredAsambleas.filter(a => 
        new Date(a.fechaHora) >= new Date(fechaDesde)
      )
    }
    
    if (fechaHasta) {
      filteredAsambleas = filteredAsambleas.filter(a => 
        new Date(a.fechaHora) <= new Date(fechaHasta)
      )
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredAsambleas = filteredAsambleas.filter(a => 
        a.titulo.toLowerCase().includes(searchLower) ||
        a.descripcion.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by date (newest first)
    filteredAsambleas.sort((a, b) => 
      new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
    )
    
    // Check for pending convocatorias
    filteredAsambleas.forEach(asamblea => {
      if (shouldSendConvocatoria(asamblea)) {
        asamblea.fechaConvocatoria = new Date().toISOString()
        // Here would trigger the actual convocatoria sending logic
      }
    })
    
    // Pagination
    const total = filteredAsambleas.length
    const totalPages = Math.ceil(total / limit)
    const paginatedAsambleas = filteredAsambleas.slice(offset, offset + limit)
    
    // Calculate statistics
    const stats = {
      total,
      programadas: asambleasDatabase.filter(a => a.estado === 'PROGRAMADA').length,
      enCurso: asambleasDatabase.filter(a => a.estado === 'EN_CURSO').length,
      finalizadas: asambleasDatabase.filter(a => a.estado === 'FINALIZADA').length,
      canceladas: asambleasDatabase.filter(a => a.estado === 'CANCELADA').length,
      porTipo: {
        ordinarias: asambleasDatabase.filter(a => a.tipo === 'ORDINARIA').length,
        extraordinarias: asambleasDatabase.filter(a => a.tipo === 'EXTRAORDINARIA').length,
        emergencia: asambleasDatabase.filter(a => a.tipo === 'EMERGENCIA').length
      },
      promedioAsistencia: asambleasDatabase
        .filter(a => a.estado === 'FINALIZADA')
        .reduce((acc, a) => acc + a.asistentes.presentes, 0) / 
        asambleasDatabase.filter(a => a.estado === 'FINALIZADA').length || 0
    }
    
    return NextResponse.json({
      success: true,
      data: paginatedAsambleas,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats
    })
    
  } catch (error) {
    console.error('Error fetching asambleas:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Create new asamblea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createAsambleaSchema.parse(body)
    
    // Create new asamblea
    const newAsamblea: Asamblea = {
      id: (asambleasDatabase.length + 1).toString(),
      titulo: validatedData.titulo,
      descripcion: validatedData.descripcion,
      tipo: validatedData.tipo,
      fechaHora: validatedData.fechaHora,
      lugar: validatedData.lugar,
      duracionEstimada: validatedData.duracionEstimada,
      quorumMinimo: validatedData.quorumMinimo,
      estado: 'PROGRAMADA',
      fechaCreacion: new Date().toISOString(),
      ordenDelDia: validatedData.ordenDelDia,
      convocatoriaDias: validatedData.convocatoriaDias,
      documentosAdjuntos: validatedData.documentosAdjuntos,
      asistentes: {
        confirmados: 0,
        presentes: 0,
        ausentes: 0,
        delegaciones: 0
      },
      quorumAlcanzado: false,
      creadorId: 'current-admin' // In production, get from auth
    }
    
    // Check if convocatoria should be sent immediately
    if (shouldSendConvocatoria(newAsamblea)) {
      newAsamblea.fechaConvocatoria = new Date().toISOString()
    }
    
    // Save to database
    asambleasDatabase.push(newAsamblea)
    
    return NextResponse.json({
      success: true,
      data: newAsamblea,
      message: `Asamblea "${newAsamblea.titulo}" creada exitosamente`
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos inválidos', 
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    console.error('Error creating asamblea:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}