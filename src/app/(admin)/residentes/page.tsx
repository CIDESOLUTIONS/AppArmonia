'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Users, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { DataTable, Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

// Tipos
interface Residente {
  id: string
  nombre: string
  apellido: string
  tipoDocumento: string
  numeroDocumento: string
  email?: string
  telefono: string
  parentesco: string
  fechaIngreso: string
  fechaSalida?: string
  estado: string
  propiedad: {
    id: string
    numero: string
    torre?: string
    tipo: string
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
  return (
    <Badge variant={estado === 'ACTIVO' ? 'default' : 'secondary'}>
      {estado}
    </Badge>
  )
}

// Componente Badge para parentesco
const ParentescoBadge = ({ parentesco }: { parentesco: string }) => {
  const variants = {
    'PROPIETARIO': 'default',
    'CONYUGUE': 'outline',
    'HIJO': 'secondary',
    'PADRE': 'secondary',
    'HERMANO': 'secondary',
    'OTRO': 'outline'
  } as const

  return (
    <Badge variant={variants[parentesco as keyof typeof variants] || 'outline'}>
      {parentesco}
    </Badge>
  )
}

export default function ResidentesPage() {
  const [residentes, setResidentes] = useState<Residente[]>([])
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
  const [selectedResidente, setSelectedResidente] = useState<Residente | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Definir columnas de la tabla
  const columns: Column<Residente>[] = [
    {
      key: 'nombre',
      title: 'Nombre Completo',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{item.nombre} {item.apellido}</div>
            <div className="text-sm text-gray-500">{item.tipoDocumento}: {item.numeroDocumento}</div>
          </div>
        </div>
      )
    },
    {
      key: 'propiedad',
      title: 'Propiedad',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">
              {item.propiedad.torre ? `${item.propiedad.torre}-${item.propiedad.numero}` : item.propiedad.numero}
            </div>
            <div className="text-sm text-gray-500">{item.propiedad.tipo}</div>
          </div>
        </div>
      )
    },
    {
      key: 'parentesco',
      title: 'Parentesco',
      render: (item) => <ParentescoBadge parentesco={item.parentesco} />
    },
    {
      key: 'contacto',
      title: 'Contacto',
      render: (item) => (
        <div className="space-y-1">
          {item.email && (
            <div className="text-sm">{item.email}</div>
          )}
          <div className="text-sm text-gray-600">{item.telefono}</div>
        </div>
      )
    },
    {
      key: 'fechas',
      title: 'Residencia',
      render: (item) => (
        <div className="space-y-1">
          <div className="text-sm">
            Desde: {new Date(item.fechaIngreso).toLocaleDateString('es-ES')}
          </div>
          {item.fechaSalida && (
            <div className="text-sm text-red-600">
              Hasta: {new Date(item.fechaSalida).toLocaleDateString('es-ES')}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (item) => <EstadoBadge estado={item.estado} />
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
  const fetchResidentes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/residentes?${params}`)
      const data = await response.json()

      if (data.success) {
        setResidentes(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching residentes:', error)
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

  const handleEdit = (residente: Residente) => {
    setSelectedResidente(residente)
    setIsEditModalOpen(true)
  }

  const handleView = (residente: Residente) => {
    setSelectedResidente(residente)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (residente: Residente) => {
    if (confirm(`¿Estás seguro de dar de baja a ${residente.nombre} ${residente.apellido}?`)) {
      try {
        const response = await fetch(`/api/residentes/${residente.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          fetchResidentes()
        }
      } catch (error) {
        console.error('Error deleting residente:', error)
      }
    }
  }

  // Effects
  useEffect(() => {
    fetchResidentes()
  }, [pagination.page, pagination.limit, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Residentes</h1>
          <p className="text-gray-600">Administra los residentes del conjunto residencial</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Residente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
          <div className="text-sm text-gray-600">Total Residentes</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {residentes.filter(r => r.estado === 'ACTIVO').length}
          </div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {residentes.filter(r => r.parentesco === 'PROPIETARIO').length}
          </div>
          <div className="text-sm text-gray-600">Propietarios</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {residentes.filter(r => r.parentesco === 'HIJO').length}
          </div>
          <div className="text-sm text-gray-600">Hijos</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        <DataTable
          data={residentes}
          columns={columns}
          loading={loading}
          searchPlaceholder="Buscar por nombre, documento, propiedad..."
          onSearch={handleSearch}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          emptyMessage="No hay residentes registrados"
        />
      </div>

      {/* Modales */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrar Nuevo Residente"
        size="lg"
      >
        <div className="text-center py-8">
          <p>Formulario de registro de residente</p>
          <p className="text-sm text-gray-500 mt-2">
            (Formulario será implementado en el siguiente paso)
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Residente"
        size="lg"
      >
        <div className="text-center py-8">
          <p>Formulario de edición de residente</p>
          <p className="text-sm text-gray-500 mt-2">
            (Formulario será implementado en el siguiente paso)
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Residente"
        size="xl"
      >
        {selectedResidente && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                <p className="text-lg font-semibold">
                  {selectedResidente.nombre} {selectedResidente.apellido}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Documento</label>
                <p className="text-lg">{selectedResidente.tipoDocumento}: {selectedResidente.numeroDocumento}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg">{selectedResidente.email || 'No registrado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="text-lg">{selectedResidente.telefono}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Parentesco</label>
                <ParentescoBadge parentesco={selectedResidente.parentesco} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <EstadoBadge estado={selectedResidente.estado} />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Información de Residencia</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Propiedad</label>
                  <p className="text-lg">
                    {selectedResidente.propiedad.torre ? `${selectedResidente.propiedad.torre}-${selectedResidente.propiedad.numero}` : selectedResidente.propiedad.numero}
                  </p>
                  <p className="text-sm text-gray-500">{selectedResidente.propiedad.tipo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Ingreso</label>
                  <p className="text-lg">{new Date(selectedResidente.fechaIngreso).toLocaleDateString('es-ES')}</p>
                </div>
                {selectedResidente.fechaSalida && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Fecha de Salida</label>
                    <p className="text-lg text-red-600">{new Date(selectedResidente.fechaSalida).toLocaleDateString('es-ES')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
