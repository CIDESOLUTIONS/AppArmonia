import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const PQREstado = z.enum(['RECIBIDO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'])
const PQRPrioridad = z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE'])

const updatePQRSchema = z.object({
  estado: PQREstado.optional(),
  prioridad: PQRPrioridad.optional(),
  responsableId: z.string().optional(),
  observaciones: z.string().optional(),
  respuesta: z.string().optional(),
  calificacion: z.number().min(1).max(5).optional(),
  comentarioCalificacion: z.string().optional(),
})

// Interface (same as in route.ts - in production, this would be shared)
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

// Simulated database - in production, import this or use Prisma
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

// GET - Get specific PQR by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const pqr = pqrDatabase.find(p => p.id === id)
    
    if (!pqr) {
      return NextResponse.json(
        { success: false, error: 'PQR no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: pqr
    })
    
  } catch (error) {
    console.error('Error fetching PQR:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Update PQR
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Find PQR
    const pqrIndex = pqrDatabase.findIndex(p => p.id === id)
    
    if (pqrIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'PQR no encontrado' },
        { status: 404 }
      )
    }
    
    // Validate input
    const validatedData = updatePQRSchema.parse(body)
    
    // Get current PQR
    const currentPQR = pqrDatabase[pqrIndex]
    
    // Update fields
    const updatedPQR: PQR = {
      ...currentPQR,
      ...validatedData
    }
    
    // Handle state transitions
    if (validatedData.estado) {
      const now = new Date().toISOString()
      
      // If moving to RESUELTO and there's a response, set fechaRespuesta
      if (validatedData.estado === 'RESUELTO' && validatedData.respuesta && !currentPQR.fechaRespuesta) {
        updatedPQR.fechaRespuesta = now
      }
      
      // If moving to CERRADO, set fechaCierre
      if (validatedData.estado === 'CERRADO' && !currentPQR.fechaCierre) {
        updatedPQR.fechaCierre = now
      }
    }
    
    // Save updated PQR
    pqrDatabase[pqrIndex] = updatedPQR
    
    // Determine what was updated for the response message
    let updateMessage = 'PQR actualizado exitosamente'
    if (validatedData.respuesta) {
      updateMessage = 'Respuesta agregada exitosamente'
    } else if (validatedData.estado) {
      updateMessage = `Estado cambiado a ${validatedData.estado}`
    } else if (validatedData.prioridad) {
      updateMessage = `Prioridad cambiada a ${validatedData.prioridad}`
    }
    
    return NextResponse.json({
      success: true,
      data: updatedPQR,
      message: updateMessage
    })
    
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
    
    console.error('Error updating PQR:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Delete PQR (soft delete by changing status)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Find PQR
    const pqrIndex = pqrDatabase.findIndex(p => p.id === id)
    
    if (pqrIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'PQR no encontrado' },
        { status: 404 }
      )
    }
    
    const pqr = pqrDatabase[pqrIndex]
    
    // Check if PQR can be deleted (only RECIBIDO state can be deleted)
    if (pqr.estado !== 'RECIBIDO') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Solo se pueden eliminar PQRs en estado RECIBIDO' 
        },
        { status: 400 }
      )
    }
    
    // Remove from database (in production, consider soft delete)
    pqrDatabase.splice(pqrIndex, 1)
    
    return NextResponse.json({
      success: true,
      message: `PQR ${pqr.numero} eliminado exitosamente`
    })
    
  } catch (error) {
    console.error('Error deleting PQR:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}