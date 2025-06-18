'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { DataTable, Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

// Tipos
interface Propiedad {
  id: string
  numero: string
  torre?: string
  tipo: string
  area: number
  habitaciones?: number
  banos?: number
  parqueaderos: number
  estado: string
  coeficiente: number
  _count: {
    propietarios: number
    residentes: number
    vehiculos: number
    mascotas: number
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Componente Badge para estado
const EstadoBadge = ({ estado }: { estado: string }) => {
  const variants = {
    'HABITADA': 'default',
    'DESOCUPADA': 'secondary',
    'EN_ARRIENDO': 'outline',
    'EN_VENTA': 'destructive',
    'EN_MANTENIMIENTO': 'secondary'
  } as const

  return (
    <Badge variant={variants[estado as keyof typeof variants] || 'secondary'}>
      {estado.replace('_', ' ')}
    </Badge>
  )
}

export default function PropiedadesPage() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedPropiedad, setSelectedPropiedad] = useState<Propiedad | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Definir columnas de la tabla
  const columns: Column<Propiedad>[] = [
    {
      key: 'numero',
      title: 'Número',
      render: (item) => (
        <div className="font-medium">
          {item.torre ? `${item.torre}-${item.numero}` : item.numero}
        </div>
      )
    },
    {
      key: 'tipo',
      title: 'Tipo',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          {item.tipo}
        </div>
      )
    },
    {
      key: 'area',
      title: 'Área (m²)',
      render: (item) => `${item.area} m²`
    },
    {
      key: 'habitaciones',
      title: 'Hab/Baños',
      render: (item) => `${item.habitaciones || 0}/${item.banos || 0}`
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (item) => <EstadoBadge estado={item.estado} />
    },
    {
      key: 'ocupacion',
      title: 'Ocupación',
      render: (item) => (
        <div className="text-sm">
          <div>👥 {item._count.residentes} residentes</div>
          <div>🚗 {item._count.vehiculos} vehículos</div>
        </div>
      )
    },
    {
      key: 'coeficiente',
      title: 'Coeficiente',
      render: (item) => `${(item.coeficiente * 100).toFixed(4)}%`
    },
    {
      key: 'acciones',
      title: 'Acciones',
      render: (item) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(item)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ]

  // Funciones de manejo
  const fetchPropiedades = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/propiedades?${params}`)
      const data = await response.json()

      if (data.success) {
        setPropiedades(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching propiedades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
  }

  const handleCreate = () => {
    setIsCreateModalOpen(true)
  }

  const handleEdit = (propiedad: Propiedad) => {
    setSelectedPropiedad(propiedad)
    setIsEditModalOpen(true)
  }

  const handleView = (propiedad: Propiedad) => {
    setSelectedPropiedad(propiedad)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (propiedad: Propiedad) => {
    if (confirm(`¿Estás seguro de eliminar la propiedad ${propiedad.numero}?`)) {
      try {
        const response = await fetch(`/api/propiedades/${propiedad.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          fetchPropiedades()
        }
      } catch (error) {
        console.error('Error deleting propiedad:', error)
      }
    }
  }

  // Effects
  useEffect(() => {
    fetchPropiedades()
  }, [pagination.page, pagination.limit, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Propiedades</h1>
          <p className="text-gray-600">Administra las unidades del conjunto residencial</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Propiedad
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
          <div className="text-sm text-gray-600">Total Propiedades</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {propiedades.filter(p => p.estado === 'HABITADA').length}
          </div>
          <div className="text-sm text-gray-600">Habitadas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {propiedades.filter(p => p.estado === 'DESOCUPADA').length}
          </div>
          <div className="text-sm text-gray-600">Desocupadas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {propiedades.filter(p => p.estado === 'EN_MANTENIMIENTO').length}
          </div>
          <div className="text-sm text-gray-600">En Mantenimiento</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        <DataTable
          data={propiedades}
          columns={columns}
          loading={loading}
          searchPlaceholder="Buscar por número, torre..."
          onSearch={handleSearch}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          emptyMessage="No hay propiedades registradas"
        />
      </div>

      {/* Modales */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Propiedad"
        size="lg"
      >
        <div className="text-center py-8">
          <p>Formulario de creación de propiedad</p>
          <p className="text-sm text-gray-500 mt-2">
            (Formulario será implementado en el siguiente paso)
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Propiedad"
        size="lg"
      >
        <div className="text-center py-8">
          <p>Formulario de edición de propiedad</p>
          <p className="text-sm text-gray-500 mt-2">
            (Formulario será implementado en el siguiente paso)
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles de la Propiedad"
        size="xl"
      >
        {selectedPropiedad && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Número</label>
                <p className="text-lg font-semibold">
                  {selectedPropiedad.torre ? `${selectedPropiedad.torre}-${selectedPropiedad.numero}` : selectedPropiedad.numero}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo</label>
                <p className="text-lg">{selectedPropiedad.tipo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Área</label>
                <p className="text-lg">{selectedPropiedad.area} m²</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <EstadoBadge estado={selectedPropiedad.estado} />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Ocupación Actual</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>👥 {selectedPropiedad._count.residentes} residentes</div>
                <div>🚗 {selectedPropiedad._count.vehiculos} vehículos</div>
                <div>🏠 {selectedPropiedad._count.propietarios} propietarios</div>
                <div>🐕 {selectedPropiedad._count.mascotas} mascotas</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
