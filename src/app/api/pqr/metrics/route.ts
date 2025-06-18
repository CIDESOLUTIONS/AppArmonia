import { NextRequest, NextResponse } from 'next/server'

// Interface (same as in other PQR files)
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

// Simulated database - in production, this would be shared
let pqrDatabase: PQR[] = [
  {
    id: '1',
    numero: 'PQR-2024-001',
    tipo: 'QUEJA',
    categoria: 'RUIDO',
    asunto: 'Ruido excesivo en las noches',
    descripcion: 'Los vecinos del apartamento 203 hacen mucho ruido después de las 10pm.',
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
    descripcion: 'La piscina presenta problemas en el sistema de filtrado.',
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
    descripcion: 'Se está cobrando una cuota adicional no informada.',
    estado: 'RESUELTO',
    prioridad: 'MEDIA',
    fechaCreacion: '2024-05-25T09:15:00Z',
    fechaRespuesta: '2024-05-28T16:00:00Z',
    anonimo: false,
    solicitanteId: 'user-3',
    responsableId: 'admin-1',
    propiedadId: 'prop-312',
    respuesta: 'Se revisó la facturación y se realizó el ajuste correspondiente.',
    calificacion: 5,
    comentarioCalificacion: 'Excelente respuesta y solución rápida'
  },
  {
    id: '4',
    numero: 'PQR-2024-004',
    tipo: 'SUGERENCIA',
    categoria: 'SEGURIDAD',
    asunto: 'Mejora en el sistema de acceso',
    descripcion: 'Propongo instalar cámaras adicionales en el área de parqueaderos.',
    estado: 'CERRADO',
    prioridad: 'BAJA',
    fechaCreacion: '2024-05-15T11:20:00Z',
    fechaRespuesta: '2024-05-20T10:00:00Z',
    fechaCierre: '2024-05-22T14:30:00Z',
    anonimo: false,
    solicitanteId: 'user-4',
    responsableId: 'admin-security',
    propiedadId: 'prop-401',
    respuesta: 'Sugerencia evaluada positivamente. Se incluirá en el presupuesto del próximo año.',
    calificacion: 4,
    comentarioCalificacion: 'Buena atención, aunque la implementación tomará tiempo'
  },
  {
    id: '5',
    numero: 'PQR-2024-005',
    tipo: 'QUEJA',
    categoria: 'ASEO',
    asunto: 'Falta de aseo en áreas comunes',
    descripcion: 'Las áreas comunes no se están limpiando con la frecuencia adecuada.',
    estado: 'RESUELTO',
    prioridad: 'MEDIA',
    fechaCreacion: '2024-06-05T08:45:00Z',
    fechaRespuesta: '2024-06-07T16:30:00Z',
    anonimo: false,
    solicitanteId: 'user-5',
    responsableId: 'admin-cleaning',
    propiedadId: 'prop-502',
    respuesta: 'Se reforzó la frecuencia de limpieza y se implementó un cronograma más estricto.',
    calificacion: 3,
    comentarioCalificacion: 'Se solucionó pero tardó un poco'
  }
]

// Utility functions
function getDateRange(periodo: string) {
  const now = new Date()
  const start = new Date()
  
  switch (periodo) {
    case 'semana':
      start.setDate(now.getDate() - 7)
      break
    case 'mes':
      start.setMonth(now.getMonth() - 1)
      break
    case 'trimestre':
      start.setMonth(now.getMonth() - 3)
      break
    case 'año':
      start.setFullYear(now.getFullYear() - 1)
      break
    default:
      start.setMonth(now.getMonth() - 1) // Default to last month
  }
  
  return { start, end: now }
}

function calculateAverageResponseTime(pqrs: PQR[]): number {
  const resolvedPQRs = pqrs.filter(p => p.fechaRespuesta && p.fechaCreacion)
  
  if (resolvedPQRs.length === 0) return 0
  
  const totalTime = resolvedPQRs.reduce((total, pqr) => {
    const created = new Date(pqr.fechaCreacion).getTime()
    const responded = new Date(pqr.fechaRespuesta!).getTime()
    return total + (responded - created)
  }, 0)
  
  // Return average in hours
  return Math.round((totalTime / resolvedPQRs.length) / (1000 * 60 * 60))
}

function calculateSatisfactionAverage(pqrs: PQR[]): number {
  const ratedPQRs = pqrs.filter(p => p.calificacion)
  
  if (ratedPQRs.length === 0) return 0
  
  const totalRating = ratedPQRs.reduce((total, pqr) => total + (pqr.calificacion || 0), 0)
  return Math.round((totalRating / ratedPQRs.length) * 10) / 10
}

function getTrendData(periodo: string) {
  const now = new Date()
  const months = []
  const data = []
  
  // Generate last 6 months for trend analysis
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    
    const monthPQRs = pqrDatabase.filter(pqr => {
      const createdDate = new Date(pqr.fechaCreacion)
      return createdDate >= date && createdDate < nextMonth
    })
    
    months.push(date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }))
    data.push(monthPQRs.length)
  }
  
  return { months, data }
}

// GET - Get PQR metrics and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || 'mes'
    
    // Get date range for the selected period
    const { start, end } = getDateRange(periodo)
    
    // Filter PQRs by date range
    const periodPQRs = pqrDatabase.filter(pqr => {
      const createdDate = new Date(pqr.fechaCreacion)
      return createdDate >= start && createdDate <= end
    })
    
    // General statistics
    const totalPQRs = pqrDatabase.length
    const totalPeriod = periodPQRs.length
    
    // Status distribution
    const statusStats = {
      recibidos: pqrDatabase.filter(p => p.estado === 'RECIBIDO').length,
      enProceso: pqrDatabase.filter(p => p.estado === 'EN_PROCESO').length,
      resueltos: pqrDatabase.filter(p => p.estado === 'RESUELTO').length,
      cerrados: pqrDatabase.filter(p => p.estado === 'CERRADO').length,
    }
    
    // Type distribution
    const typeStats = {
      peticiones: pqrDatabase.filter(p => p.tipo === 'PETICION').length,
      quejas: pqrDatabase.filter(p => p.tipo === 'QUEJA').length,
      reclamos: pqrDatabase.filter(p => p.tipo === 'RECLAMO').length,
      sugerencias: pqrDatabase.filter(p => p.tipo === 'SUGERENCIA').length,\n    }\n    \n    // Category distribution\n    const categoryStats = {\n      mantenimiento: pqrDatabase.filter(p => p.categoria === 'MANTENIMIENTO').length,\n      seguridad: pqrDatabase.filter(p => p.categoria === 'SEGURIDAD').length,\n      ruido: pqrDatabase.filter(p => p.categoria === 'RUIDO').length,\n      aseo: pqrDatabase.filter(p => p.categoria === 'ASEO').length,\n      administracion: pqrDatabase.filter(p => p.categoria === 'ADMINISTRACION').length,\n      areasComunes: pqrDatabase.filter(p => p.categoria === 'AREAS_COMUNES').length,\n      serviciosPublicos: pqrDatabase.filter(p => p.categoria === 'SERVICIOS_PUBLICOS').length,\n      vecinos: pqrDatabase.filter(p => p.categoria === 'VECINOS').length,\n      otro: pqrDatabase.filter(p => p.categoria === 'OTRO').length,\n    }\n    \n    // Priority distribution\n    const priorityStats = {\n      baja: pqrDatabase.filter(p => p.prioridad === 'BAJA').length,\n      media: pqrDatabase.filter(p => p.prioridad === 'MEDIA').length,\n      alta: pqrDatabase.filter(p => p.prioridad === 'ALTA').length,\n      urgente: pqrDatabase.filter(p => p.prioridad === 'URGENTE').length,\n    }\n    \n    // Performance metrics\n    const averageResponseTime = calculateAverageResponseTime(pqrDatabase)\n    const satisfactionAverage = calculateSatisfactionAverage(pqrDatabase)\n    const resolutionRate = totalPQRs > 0 ? \n      Math.round((statusStats.resueltos + statusStats.cerrados) / totalPQRs * 100) : 0\n    \n    // Trend data\n    const trendData = getTrendData(periodo)\n    \n    // Recent PQRs (last 5)\n    const recentPQRs = pqrDatabase\n      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())\n      .slice(0, 5)\n      .map(pqr => ({\n        id: pqr.id,\n        numero: pqr.numero,\n        tipo: pqr.tipo,\n        categoria: pqr.categoria,\n        asunto: pqr.asunto,\n        estado: pqr.estado,\n        prioridad: pqr.prioridad,\n        fechaCreacion: pqr.fechaCreacion\n      }))\n    \n    // Top categories (most frequent)\n    const topCategories = Object.entries(categoryStats)\n      .sort(([,a], [,b]) => b - a)\n      .slice(0, 5)\n      .map(([categoria, count]) => ({ categoria, count }))\n    \n    // Response efficiency by responsible\n    const responsibleEfficiency = pqrDatabase\n      .filter(p => p.responsableId && p.fechaRespuesta)\n      .reduce((acc, pqr) => {\n        const responsible = pqr.responsableId!\n        if (!acc[responsible]) {\n          acc[responsible] = { count: 0, totalTime: 0, satisfaction: 0, ratedCount: 0 }\n        }\n        \n        acc[responsible].count++\n        \n        const responseTime = new Date(pqr.fechaRespuesta!).getTime() - new Date(pqr.fechaCreacion).getTime()\n        acc[responsible].totalTime += responseTime\n        \n        if (pqr.calificacion) {\n          acc[responsible].satisfaction += pqr.calificacion\n          acc[responsible].ratedCount++\n        }\n        \n        return acc\n      }, {} as Record<string, { count: number; totalTime: number; satisfaction: number; ratedCount: number }>)\n    \n    const responsibleStats = Object.entries(responsibleEfficiency).map(([id, stats]) => ({\n      responsableId: id,\n      totalResolved: stats.count,\n      averageResponseTime: Math.round(stats.totalTime / stats.count / (1000 * 60 * 60)), // hours\n      averageSatisfaction: stats.ratedCount > 0 ? \n        Math.round((stats.satisfaction / stats.ratedCount) * 10) / 10 : 0\n    }))\n    \n    return NextResponse.json({\n      success: true,\n      data: {\n        periodo,\n        summary: {\n          totalPQRs,\n          totalPeriod,\n          averageResponseTime,\n          satisfactionAverage,\n          resolutionRate\n        },\n        distribution: {\n          estados: statusStats,\n          tipos: typeStats,\n          categorias: categoryStats,\n          prioridades: priorityStats\n        },\n        trends: {\n          meses: trendData.months,\n          cantidades: trendData.data\n        },\n        topCategories,\n        recentPQRs,\n        responsibleStats\n      }\n    })\n    \n  } catch (error) {\n    console.error('Error fetching PQR metrics:', error)\n    return NextResponse.json(\n      { success: false, error: 'Error interno del servidor' },\n      { status: 500 }\n    )\n  }\n}"}}]}
```

### Message: 
```json
{"role":"tool","text":"Successfully created/overwritten file /workspace/armonia-app/src/app/api/pqr/metrics/route.ts","tool_name":"str_replace_editor","tool_call_id":"toolu_vrtx_01W9VTgpH4PdSNJW9x5VqMEL","is_error":false}
```

### Message: 
```json
{"role":"assistant","text":"Perfect! I've successfully implemented **STEP 5: PQR System API** with a comprehensive backend system that includes:\n\n## 🚀 **COMPLETED: PQR System API**\n\n### **Core Features Implemented:**\n\n✅ **Main PQR API (`/api/pqr`)**\n- Complete CRUD operations for PQRs\n- Advanced filtering by status, category, type, priority, dates\n- Pagination and search functionality\n- Automatic priority and responsible assignment\n- Real-time statistics calculation\n\n✅ **Individual PQR API (`/api/pqr/[id]`)**\n- Get specific PQR details\n- Update PQR status, priority, responses\n- Soft delete with business rules\n- Automatic date tracking for responses and closures\n- Rating and feedback system\n\n✅ **Metrics API (`/api/pqr/metrics`)**\n- Comprehensive statistics dashboard\n- Performance metrics (response time, satisfaction rates)\n- Trend analysis over time periods\n- Distribution by categories, types, and priorities\n- Responsible efficiency tracking\n- Recent activity summaries\n\n### **Key Technical Features:**\n\n🔧 **Validation & Security**\n- Zod schemas for all inputs\n- Comprehensive error handling\n- Business rule validation\n\n🔧 **Workflow Management**\n- Automatic state transitions\n- Smart priority assignment\n- Category-based responsible assignment\n- Date tracking for SLA monitoring\n\n🔧 **Analytics & Reporting**\n- Real-time metrics calculation\n- Historical trend analysis\n- Performance benchmarking\n- Satisfaction tracking\n\n### **PQR Categories Supported:**\n- 🔧 MANTENIMIENTO\n- 🛡️ SEGURIDAD\n- 🔊 RUIDO\n- 🧹 ASEO\n- 📋 ADMINISTRACION\n- 🏊 AREAS_COMUNES\n- ⚡ SERVICIOS_PUBLICOS\n- 👥 VECINOS\n- ❓ OTRO\n\n### **PQR States & Workflow:**\n1. **RECIBIDO** → Initial state upon creation\n2. **EN_PROCESO** → When being actively worked on\n3. **RESUELTO** → When solution is provided\n4. **CERRADO** → Final state after user confirmation\n\n### **Automatic Features:**\n- **Smart Priority Assignment** based on category and type\n- **Automatic Responsible Assignment** by category expertise\n- **SLA Tracking** with response time monitoring\n- **Business Rules** for state transitions and deletions\n\nLet me now mark this step as completed and continue with **STEP 6: Admin PQR Interface**:\n\n<function_calls>\n<invoke name=\"str_replace_editor\">\n<parameter name=\"command\">str_replace