import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// PQR Types and Validation Schemas
const PQRTipo = z.enum(['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA'])
const PQRCategoria = z.enum([
  'MANTENIMIENTO',
  'SEGURIDAD', 
  'RUIDO',
  'ASEO',
  'ADMINISTRACION',
  'AREAS_COMUNES',
  'SERVICIOS_PUBLICOS',
  'VECINOS',
  'OTRO'
])
const PQREstado = z.enum(['RECIBIDO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'])
const PQRPrioridad = z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE'])

const createPQRSchema = z.object({
  tipo: PQRTipo,
  categoria: PQRCategoria,
  asunto: z.string().min(5, 'El asunto debe tener al menos 5 caracteres').max(200),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  anonimo: z.boolean().default(false),
  adjuntos: z.array(z.string()).optional(),
  propiedadId: z.string().optional(), // Para asociar PQR a una propiedad específica
})

const updatePQRSchema = z.object({
  estado: PQREstado.optional(),
  prioridad: PQRPrioridad.optional(),
  responsableId: z.string().optional(),
  observaciones: z.string().optional(),
  fechaRespuesta: z.string().optional(),
  respuesta: z.string().optional(),
})

// Simulated database (in production, use Prisma)
interface PQR {
  id: string
  numero: string
  tipo: string
  categoria: string
  asunto: string
  descripcion: string
  estado: string
  prioridad: string
  fechaCreacion: string
  fechaRespuesta?: string
  fechaCierre?: string
  anonimo: boolean
  solicitanteId: string
  responsableId?: string
  propiedadId?: string
  respuesta?: string
  observaciones?: string
  adjuntos?: string[]
  calificacion?: number
  comentarioCalificacion?: string
}

// Simulate PQR database
let pqrDatabase: PQR[] = [
  {
    id: '1',
    numero: 'PQR-2024-001',
    tipo: 'QUEJA',
    categoria: 'RUIDO',
    asunto: 'Ruido excesivo en las noches',
    descripcion: 'Los vecinos del apartamento 203 hacen mucho ruido después de las 10pm, afectando el descanso de mi familia.',
    estado: 'EN_PROCESO',
    prioridad: 'MEDIA',
    fechaCreacion: '2024-06-01T10:00:00Z',
    anonimo: false,
    solicitanteId: 'user-1',
    responsableId: 'admin-1',
    propiedadId: 'prop-101',
    observaciones: 'Se programó reunión con ambas partes para el 15 de junio.'
  },
  {
    id: '2',
    numero: 'PQR-2024-002',
    tipo: 'PETICION',
    categoria: 'AREAS_COMUNES',
    asunto: 'Solicitud de mantenimiento en la piscina',
    descripcion: 'La piscina presenta problemas en el sistema de filtrado. Requiere mantenimiento urgente.',
    estado: 'RECIBIDO',
    prioridad: 'ALTA',
    fechaCreacion: '2024-06-10T14:30:00Z',
    anonimo: false,
    solicitanteId: 'user-2',
    propiedadId: 'prop-205'
  },
  {
    id: '3',
    numero: 'PQR-2024-003',
    tipo: 'RECLAMO',
    categoria: 'ADMINISTRACION',
    asunto: 'Error en el cobro de cuota de administración',
    descripcion: 'Se está cobrando una cuota adicional que no fue informada previamente en la asamblea.',
    estado: 'RESUELTO',
    prioridad: 'MEDIA',
    fechaCreacion: '2024-05-25T09:15:00Z',
    fechaRespuesta: '2024-05-28T16:00:00Z',
    anonimo: false,
    solicitanteId: 'user-3',
    responsableId: 'admin-1',
    propiedadId: 'prop-312',
    respuesta: 'Se revisó la facturación y se encontró el error. Se realizó el ajuste correspondiente y se generó nota crédito.',
    calificacion: 5,
    comentarioCalificacion: 'Excelente respuesta y solución rápida'
  }
]

// Utility functions
function generatePQRNumber(): string {
  const year = new Date().getFullYear()
  const nextNumber = pqrDatabase.length + 1
  return `PQR-${year}-${nextNumber.toString().padStart(3, '0')}`
}

function assignAutomaticPriority(categoria: string, tipo: string): string {
  // Auto-assign priority based on category and type
  const highPriorityCategories = ['SEGURIDAD', 'SERVICIOS_PUBLICOS']
  const urgentCategories = ['MANTENIMIENTO'] // if it's a RECLAMO
  
  if (tipo === 'RECLAMO' && urgentCategories.includes(categoria)) {
    return 'URGENTE'
  }
  if (highPriorityCategories.includes(categoria)) {
    return 'ALTA'
  }
  if (tipo === 'QUEJA') {
    return 'MEDIA'
  }
  return 'BAJA'
}

function assignAutomaticResponsible(categoria: string): string | undefined {
  // Auto-assign responsible based on category
  const categoryAssignments: { [key: string]: string } = {
    'MANTENIMIENTO': 'admin-maintenance',
    'SEGURIDAD': 'admin-security',
    'ASEO': 'admin-cleaning',
    'ADMINISTRACION': 'admin-general',
    'AREAS_COMUNES': 'admin-maintenance',
    'SERVICIOS_PUBLICOS': 'admin-services'
  }
  
  return categoryAssignments[categoria]
}

// GET - List PQRs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Filters
    const estado = searchParams.get('estado')
    const categoria = searchParams.get('categoria')
    const tipo = searchParams.get('tipo')
    const prioridad = searchParams.get('prioridad')
    const solicitanteId = searchParams.get('solicitanteId')
    const responsableId = searchParams.get('responsableId')
    const search = searchParams.get('search')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')
    
    // Apply filters
    let filteredPQRs = pqrDatabase
    
    if (estado) {
      filteredPQRs = filteredPQRs.filter(pqr => pqr.estado === estado)
    }
    
    if (categoria) {
      filteredPQRs = filteredPQRs.filter(pqr => pqr.categoria === categoria)
    }
    
    if (tipo) {
      filteredPQRs = filteredPQRs.filter(pqr => pqr.tipo === tipo)
    }
    
    if (prioridad) {
      filteredPQRs = filteredPQRs.filter(pqr => pqr.prioridad === prioridad)
    }
    
    if (solicitanteId) {
      filteredPQRs = filteredPQRs.filter(pqr => pqr.solicitanteId === solicitanteId)
    }
    
    if (responsableId) {
      filteredPQRs = filteredPQRs.filter(pqr => pqr.responsableId === responsableId)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPQRs = filteredPQRs.filter(pqr => 
        pqr.asunto.toLowerCase().includes(searchLower) ||
        pqr.descripcion.toLowerCase().includes(searchLower) ||
        pqr.numero.toLowerCase().includes(searchLower)
      )
    }
    
    if (fechaDesde) {
      filteredPQRs = filteredPQRs.filter(pqr => 
        new Date(pqr.fechaCreacion) >= new Date(fechaDesde)
      )
    }
    
    if (fechaHasta) {
      filteredPQRs = filteredPQRs.filter(pqr => 
        new Date(pqr.fechaCreacion) <= new Date(fechaHasta)
      )
    }
    
    // Sort by creation date (newest first)
    filteredPQRs.sort((a, b) => 
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    )
    
    // Pagination
    const total = filteredPQRs.length
    const totalPages = Math.ceil(total / limit)
    const paginatedPQRs = filteredPQRs.slice(offset, offset + limit)
    
    // Calculate statistics
    const stats = {
      total,
      recibidos: pqrDatabase.filter(p => p.estado === 'RECIBIDO').length,
      enProceso: pqrDatabase.filter(p => p.estado === 'EN_PROCESO').length,
      resueltos: pqrDatabase.filter(p => p.estado === 'RESUELTO').length,
      cerrados: pqrDatabase.filter(p => p.estado === 'CERRADO').length,
      porCategoria: {
        mantenimiento: pqrDatabase.filter(p => p.categoria === 'MANTENIMIENTO').length,
        seguridad: pqrDatabase.filter(p => p.categoria === 'SEGURIDAD').length,
        ruido: pqrDatabase.filter(p => p.categoria === 'RUIDO').length,
        aseo: pqrDatabase.filter(p => p.categoria === 'ASEO').length,
        administracion: pqrDatabase.filter(p => p.categoria === 'ADMINISTRACION').length,
        areasComunes: pqrDatabase.filter(p => p.categoria === 'AREAS_COMUNES').length,
        serviciosPublicos: pqrDatabase.filter(p => p.categoria === 'SERVICIOS_PUBLICOS').length,
        vecinos: pqrDatabase.filter(p => p.categoria === 'VECINOS').length,
        otro: pqrDatabase.filter(p => p.categoria === 'OTRO').length,
      }
    }
    
    return NextResponse.json({
      success: true,
      data: paginatedPQRs,
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
    console.error('Error fetching PQRs:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Create new PQR
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createPQRSchema.parse(body)
    
    // Auto-assign values
    const prioridad = assignAutomaticPriority(validatedData.categoria, validatedData.tipo)
    const responsableId = assignAutomaticResponsible(validatedData.categoria)
    
    // Create new PQR
    const newPQR: PQR = {
      id: (pqrDatabase.length + 1).toString(),
      numero: generatePQRNumber(),
      tipo: validatedData.tipo,
      categoria: validatedData.categoria,
      asunto: validatedData.asunto,
      descripcion: validatedData.descripcion,
      estado: 'RECIBIDO',
      prioridad,
      fechaCreacion: new Date().toISOString(),
      anonimo: validatedData.anonimo,
      solicitanteId: 'current-user', // In production, get from auth
      responsableId,
      propiedadId: validatedData.propiedadId,
      adjuntos: validatedData.adjuntos
    }
    
    // Save to database
    pqrDatabase.push(newPQR)
    
    return NextResponse.json({
      success: true,
      data: newPQR,
      message: `PQR ${newPQR.numero} creado exitosamente`
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
    
    console.error('Error creating PQR:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}