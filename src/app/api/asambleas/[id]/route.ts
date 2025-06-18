import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas (reusing from main route)
const AsambleaEstado = z.enum(['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'])

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
  observaciones: z.string().optional(),
  asistentes: z.object({
    confirmados: z.number().min(0).optional(),
    presentes: z.number().min(0).optional(),
    ausentes: z.number().min(0).optional(),
    delegaciones: z.number().min(0).optional()
  }).optional()
})

// Interfaces (same as main route)
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

// Simulated database (same as main route)
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
      }
    ],
    convocatoriaDias: 8,
    documentosAdjuntos: ['estados-financieros-mayo.pdf'],
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
      }
    ],
    convocatoriaDias: 8,
    documentosAdjuntos: ['informe-seguridad-abril.pdf'],
    actaResumen: 'Se aprobó por mayoría la instalación de 4 cámaras adicionales en áreas comunes.',
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
function calculateQuorum(totalPropietarios: number, presentes: number, delegaciones: number, quorumMinimo: number): boolean {
  const totalVotos = presentes + delegaciones
  const porcentajeAsistencia = (totalVotos / totalPropietarios) * 100
  return porcentajeAsistencia >= quorumMinimo
}

function canStartAsamblea(asamblea: Asamblea): boolean {
  const now = new Date()
  const fechaAsamblea = new Date(asamblea.fechaHora)
  const tiempoAntes = fechaAsamblea.getTime() - now.getTime()
  
  // Permitir iniciar 15 minutos antes de la hora programada
  return tiempoAntes <= 15 * 60 * 1000 && asamblea.estado === 'PROGRAMADA'
}

// GET - Get specific asamblea by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const asamblea = asambleasDatabase.find(a => a.id === id)
    
    if (!asamblea) {
      return NextResponse.json(
        { success: false, error: 'Asamblea no encontrada' },
        { status: 404 }
      )
    }
    
    // Add computed fields
    const totalPropietarios = 85 // In production, get from database
    const quorumAlcanzado = calculateQuorum(
      totalPropietarios, 
      asamblea.asistentes.presentes, 
      asamblea.asistentes.delegaciones,
      asamblea.quorumMinimo
    )
    
    const asambleaWithExtras = {
      ...asamblea,
      quorumAlcanzado,
      totalPropietarios,
      canStart: canStartAsamblea(asamblea),
      porcentajeAsistencia: Math.round(
        ((asamblea.asistentes.presentes + asamblea.asistentes.delegaciones) / totalPropietarios) * 100
      )
    }
    
    return NextResponse.json({
      success: true,
      data: asambleaWithExtras
    })
    
  } catch (error) {
    console.error('Error fetching asamblea:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Update asamblea
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Find asamblea
    const asambleaIndex = asambleasDatabase.findIndex(a => a.id === id)
    
    if (asambleaIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Asamblea no encontrada' },
        { status: 404 }
      )
    }
    
    // Validate input
    const validatedData = updateAsambleaSchema.parse(body)
    
    // Get current asamblea
    const currentAsamblea = asambleasDatabase[asambleaIndex]
    
    // Business rules validation
    if (currentAsamblea.estado === 'FINALIZADA' && validatedData.estado !== 'FINALIZADA') {
      return NextResponse.json(
        { success: false, error: 'No se puede modificar una asamblea finalizada' },
        { status: 400 }
      )
    }
    
    // Update fields
    const updatedAsamblea: Asamblea = {
      ...currentAsamblea,
      ...validatedData
    }
    
    // Handle state transitions
    const now = new Date().toISOString()
    
    if (validatedData.estado) {
      switch (validatedData.estado) {
        case 'EN_CURSO':
          if (currentAsamblea.estado === 'PROGRAMADA') {
            if (!canStartAsamblea(currentAsamblea)) {
              return NextResponse.json(
                { success: false, error: 'No se puede iniciar la asamblea fuera del horario permitido' },
                { status: 400 }
              )
            }
            updatedAsamblea.fechaInicio = now
          }
          break
          
        case 'FINALIZADA':
          if (currentAsamblea.estado === 'EN_CURSO') {
            updatedAsamblea.fechaFin = now
            
            // Calculate final quorum
            const totalPropietarios = 85 // In production, get from database
            updatedAsamblea.quorumAlcanzado = calculateQuorum(
              totalPropietarios,
              updatedAsamblea.asistentes.presentes,
              updatedAsamblea.asistentes.delegaciones,
              updatedAsamblea.quorumMinimo
            )
          }
          break
          
        case 'CANCELADA':
          if (currentAsamblea.estado === 'PROGRAMADA') {
            // Allow cancellation only if not started
            updatedAsamblea.observaciones = updatedAsamblea.observaciones || 'Asamblea cancelada'
          } else {
            return NextResponse.json(
              { success: false, error: 'Solo se pueden cancelar asambleas programadas' },
              { status: 400 }
            )
          }
          break
      }
    }
    
    // Update asistentes if provided
    if (validatedData.asistentes) {
      updatedAsamblea.asistentes = {
        ...updatedAsamblea.asistentes,
        ...validatedData.asistentes
      }
      
      // Recalculate quorum if asistentes changed
      const totalPropietarios = 85
      updatedAsamblea.quorumAlcanzado = calculateQuorum(
        totalPropietarios,
        updatedAsamblea.asistentes.presentes,
        updatedAsamblea.asistentes.delegaciones,
        updatedAsamblea.quorumMinimo
      )
    }
    
    // Save updated asamblea
    asambleasDatabase[asambleaIndex] = updatedAsamblea
    
    // Determine update message
    let updateMessage = 'Asamblea actualizada exitosamente'
    if (validatedData.estado) {
      const estadoMessages = {
        'EN_CURSO': 'Asamblea iniciada exitosamente',
        'FINALIZADA': 'Asamblea finalizada exitosamente',
        'CANCELADA': 'Asamblea cancelada',
        'PROGRAMADA': 'Asamblea reprogramada'
      }
      updateMessage = estadoMessages[validatedData.estado] || updateMessage
    } else if (validatedData.asistentes) {
      updateMessage = 'Asistencia actualizada exitosamente'
    }
    
    return NextResponse.json({
      success: true,
      data: updatedAsamblea,
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
    
    console.error('Error updating asamblea:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Delete asamblea (only if PROGRAMADA)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Find asamblea
    const asambleaIndex = asambleasDatabase.findIndex(a => a.id === id)
    
    if (asambleaIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Asamblea no encontrada' },
        { status: 404 }
      )
    }
    
    const asamblea = asambleasDatabase[asambleaIndex]
    
    // Check if asamblea can be deleted
    if (asamblea.estado !== 'PROGRAMADA') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Solo se pueden eliminar asambleas en estado PROGRAMADA' 
        },
        { status: 400 }
      )
    }
    
    // Remove from database
    asambleasDatabase.splice(asambleaIndex, 1)
    
    return NextResponse.json({
      success: true,
      message: `Asamblea "${asamblea.titulo}" eliminada exitosamente`
    })
    
  } catch (error) {
    console.error('Error deleting asamblea:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}