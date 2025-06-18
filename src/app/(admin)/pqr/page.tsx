'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Filter, Search, MessageSquare, Clock, CheckCircle, AlertTriangle, Eye, Edit, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { DataTable, Column } from '@/components/ui/data-table'

// Tipos
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
  calificacion?: number
}

interface Metricas {
  total: number
  recibidos: number
  enProceso: number
  resueltos: number
  cerrados: number
  tiempoPromedioRespuesta: number
  satisfaccionPromedio: number
  tasaResolucion: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Componentes Badge
const EstadoBadge = ({ estado }: { estado: string }) => {
  const variants = {
    'RECIBIDO': 'destructive',
    'EN_PROCESO': 'secondary', 
    'RESUELTO': 'default',
    'CERRADO': 'outline'
  } as const
  
  return <Badge variant={variants[estado as keyof typeof variants] || 'outline'}>{estado.replace('_', ' ')}</Badge>
}

const PrioridadBadge = ({ prioridad }: { prioridad: string }) => {
  const variants = {
    'BAJA': 'outline',
    'MEDIA': 'secondary',
    'ALTA': 'default', 
    'URGENTE': 'destructive'
  } as const
  
  return <Badge variant={variants[prioridad as keyof typeof variants] || 'outline'}>{prioridad}</Badge>
}

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const colors = {
    'PETICION': 'bg-blue-100 text-blue-800',
    'QUEJA': 'bg-yellow-100 text-yellow-800',
    'RECLAMO': 'bg-red-100 text-red-800',
    'SUGERENCIA': 'bg-green-100 text-green-800'
  } as const
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
      {tipo}
    </span>
  )
}

export default function AdminPQRPage() {
  const [pqrs, setPqrs] = useState<PQR[]>([])
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  
  // Filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    categoria: '',
    tipo: '',
    prioridad: '',
    responsableId: '',
    search: ''
  })
  
  // Modales
  const [selectedPQR, setSelectedPQR] = useState<PQR | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  
  // Estados del formulario
  const [responseForm, setResponseForm] = useState({
    respuesta: '',
    estado: '',
    observaciones: ''
  })

  // Definir columnas de la tabla
  const columns: Column<PQR>[] = [
    {
      key: 'numero',
      title: 'Número',
      render: (item) => (
        <div className="font-medium text-primary cursor-pointer" onClick={() => handleView(item)}>
          {item.numero}
        </div>
      )
    },
    {
      key: 'tipo',
      title: 'Tipo',
      render: (item) => <TipoBadge tipo={item.tipo} />
    },
    {
      key: 'categoria',
      title: 'Categoría',
      render: (item) => (
        <span className="text-sm capitalize">{item.categoria.replace('_', ' ').toLowerCase()}</span>
      )
    },
    {
      key: 'asunto',
      title: 'Asunto',
      render: (item) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{item.asunto}</div>
          <div className="text-sm text-gray-500 truncate">{item.descripcion}</div>
        </div>
      )
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (item) => <EstadoBadge estado={item.estado} />
    },
    {
      key: 'prioridad',
      title: 'Prioridad',
      render: (item) => <PrioridadBadge prioridad={item.prioridad} />
    },
    {
      key: 'fechas',
      title: 'Fechas',
      render: (item) => (
        <div className="text-sm">
          <div>Creado: {new Date(item.fechaCreacion).toLocaleDateString('es-ES')}</div>
          {item.fechaRespuesta && (
            <div className="text-green-600">Resp: {new Date(item.fechaRespuesta).toLocaleDateString('es-ES')}</div>
          )}
        </div>
      )
    },
    {
      key: 'responsable',
      title: 'Responsable',
      render: (item) => (
        <div className="text-sm">
          {item.responsableId ? (
            <span className="text-green-600">Asignado</span>
          ) : (
            <span className="text-red-600">Sin asignar</span>
          )}
        </div>
      )
    },
    {
      key: 'acciones',
      title: 'Acciones',
      render: (item) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleResponse(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleAssign(item)}>
            <UserCheck className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  // Funciones de manejo
  const fetchPQRs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filtros).filter(([_, value]) => value !== ''))
      })

      const response = await fetch(`/api/pqr?${params}`)
      const data = await response.json()

      if (data.success) {
        setPqrs(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching PQRs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetricas = async () => {
    try {
      const response = await fetch('/api/pqr/metrics?periodo=mes')
      const data = await response.json()

      if (data.success) {
        setMetricas({
          total: data.data.summary.totalPQRs,
          recibidos: data.data.distribution.estados.recibidos,
          enProceso: data.data.distribution.estados.enProceso,
          resueltos: data.data.distribution.estados.resueltos,
          cerrados: data.data.distribution.estados.cerrados,
          tiempoPromedioRespuesta: data.data.summary.averageResponseTime,
          satisfaccionPromedio: data.data.summary.satisfactionAverage,
          tasaResolucion: data.data.summary.resolutionRate
        })
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const handleView = (pqr: PQR) => {
    setSelectedPQR(pqr)
    setIsViewModalOpen(true)
  }

  const handleResponse = (pqr: PQR) => {
    setSelectedPQR(pqr)
    setResponseForm({
      respuesta: pqr.respuesta || '',
      estado: pqr.estado,
      observaciones: pqr.observaciones || ''
    })
    setIsResponseModalOpen(true)
  }

  const handleAssign = (pqr: PQR) => {
    setSelectedPQR(pqr)
    setIsAssignModalOpen(true)
  }

  const handleSubmitResponse = async () => {
    if (!selectedPQR) return

    try {
      const response = await fetch(`/api/pqr/${selectedPQR.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseForm)
      })

      if (response.ok) {
        fetchPQRs()
        fetchMetricas()
        setIsResponseModalOpen(false)
        setSelectedPQR(null)
      }
    } catch (error) {
      console.error('Error updating PQR:', error)
    }
  }

  // Effects
  useEffect(() => {
    fetchPQRs()
    fetchMetricas()
  }, [pagination.page, pagination.limit, filtros])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de PQRs</h1>
          <p className="text-gray-600">Sistema de Peticiones, Quejas y Reclamos</p>
        </div>
      </div>

      {/* Métricas Dashboard */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{metricas.total}</div>
                <div className="text-sm text-gray-600">Total PQRs</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{metricas.enProceso}</div>
                <div className="text-sm text-gray-600">En Proceso</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{metricas.tasaResolucion}%</div>
                <div className="text-sm text-gray-600">Tasa Resolución</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{metricas.tiempoPromedioRespuesta}h</div>
                <div className="text-sm text-gray-600">Tiempo Promedio</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <select 
            value={filtros.estado} 
            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Todos los estados</option>
            <option value="RECIBIDO">Recibido</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="RESUELTO">Resuelto</option>
            <option value="CERRADO">Cerrado</option>
          </select>

          <select 
            value={filtros.categoria} 
            onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Todas las categorías</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="SEGURIDAD">Seguridad</option>
            <option value="RUIDO">Ruido</option>
            <option value="ASEO">Aseo</option>
            <option value="ADMINISTRACION">Administración</option>
          </select>

          <select 
            value={filtros.prioridad} 
            onChange={(e) => setFiltros(prev => ({ ...prev, prioridad: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Todas las prioridades</option>
            <option value="URGENTE">Urgente</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>

          <input
            type="text"
            placeholder="Buscar PQR..."
            value={filtros.search}
            onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          />

          <Button 
            variant="outline" 
            onClick={() => setFiltros({ estado: '', categoria: '', tipo: '', prioridad: '', responsableId: '', search: '' })}
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Tabla de PQRs */}
      <div className="bg-white rounded-lg border">
        <DataTable
          data={pqrs}
          columns={columns}
          loading={loading}
          searchPlaceholder="Buscar PQRs..."
          onSearch={(query) => setFiltros(prev => ({ ...prev, search: query }))}
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
          emptyMessage="No hay PQRs que coincidan con los filtros"
        />
      </div>

      {/* Modal Ver Detalles */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del PQR"
        size="xl"
      >
        {selectedPQR && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Número</label>
                <p className="text-lg font-semibold">{selectedPQR.numero}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo</label>
                <TipoBadge tipo={selectedPQR.tipo} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Categoría</label>
                <p className="text-lg">{selectedPQR.categoria.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <EstadoBadge estado={selectedPQR.estado} />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Asunto</label>
              <p className="text-lg font-medium">{selectedPQR.asunto}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Descripción</label>
              <p className="text-gray-900">{selectedPQR.descripcion}</p>
            </div>
            
            {selectedPQR.respuesta && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-600">Respuesta</label>
                <p className="text-gray-900 mt-1">{selectedPQR.respuesta}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Responder */}
      <Modal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        title="Responder PQR"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select 
              value={responseForm.estado}
              onChange={(e) => setResponseForm(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="RECIBIDO">Recibido</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="CERRADO">Cerrado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta</label>
            <textarea
              value={responseForm.respuesta}
              onChange={(e) => setResponseForm(prev => ({ ...prev, respuesta: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md h-32"
              placeholder="Escriba su respuesta aquí..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={responseForm.observaciones}
              onChange={(e) => setResponseForm(prev => ({ ...prev, observaciones: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md h-20"
              placeholder="Observaciones internas..."
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmitResponse}>Guardar Respuesta</Button>
            <Button variant="outline" onClick={() => setIsResponseModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}