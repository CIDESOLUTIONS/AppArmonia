'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, User, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { DataTable, Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

// Tipos
interface Propietario {
  id: string
  nombre: string
  apellido: string
  tipoDocumento: string
  numeroDocumento: string
  email: string
  telefono: string
  estado: string
  fechaCreacion: string
  propiedades: Array<{
    id: string
    numero: string
    torre?: string
    tipo: string
  }>
  _count: {
    propiedades: number
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

export default function PropietariosPage() {
  const [propietarios, setPropietarios] = useState<Propietario[]>([])
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
  const [selectedPropietario, setSelectedPropietario] = useState<Propietario | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Definir columnas de la tabla
  const columns: Column<Propietario>[] = [
    {
      key: 'nombre',
      title: 'Nombre Completo',
      render: (item) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{item.nombre} {item.apellido}</div>
            <div className="text-sm text-gray-500">{item.tipoDocumento}: {item.numeroDocumento}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contacto',
      title: 'Contacto',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            {item.email}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3 text-gray-400" />
            {item.telefono}
          </div>
        </div>
      )
    },
    {
      key: 'propiedades',
      title: 'Propiedades',
      render: (item) => (
        <div className="space-y-1">
          <div className="font-medium">{item._count.propiedades} propiedad(es)</div>
          {item.propiedades.slice(0, 2).map((prop, index) => (
            <div key={index} className="text-sm text-gray-600">
              {prop.torre ? `${prop.torre}-${prop.numero}` : prop.numero} ({prop.tipo})
            </div>
          ))}
          {item.propiedades.length > 2 && (
            <div className="text-sm text-gray-500">
              +{item.propiedades.length - 2} más
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
      key: 'fechaCreacion',
      title: 'Fecha Registro',
      render: (item) => new Date(item.fechaCreacion).toLocaleDateString('es-ES')
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
  const fetchPropietarios = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/propietarios?${params}`)
      const data = await response.json()

      if (data.success) {
        setPropietarios(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching propietarios:', error)
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

  const handleEdit = (propietario: Propietario) => {
    setSelectedPropietario(propietario)
    setIsEditModalOpen(true)
  }

  const handleView = (propietario: Propietario) => {
    setSelectedPropietario(propietario)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (propietario: Propietario) => {
    if (confirm(`¿Estás seguro de eliminar a ${propietario.nombre} ${propietario.apellido}?`)) {
      try {
        const response = await fetch(`/api/propietarios/${propietario.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          fetchPropietarios()
        }
      } catch (error) {
        console.error('Error deleting propietario:', error)
      }
    }
  }

  // Effects
  useEffect(() => {
    fetchPropietarios()
  }, [pagination.page, pagination.limit, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Propietarios</h1>
          <p className="text-gray-600">Administra los propietarios del conjunto residencial</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Propietario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
          <div className="text-sm text-gray-600">Total Propietarios</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {propietarios.filter(p => p.estado === 'ACTIVO').length}
          </div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {propietarios.filter(p => p._count.propiedades > 1).length}
          </div>
          <div className="text-sm text-gray-600">Múltiples Propiedades</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-600">
            {propietarios.filter(p => p.estado === 'INACTIVO').length}
          </div>
          <div className="text-sm text-gray-600">Inactivos</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        <DataTable
          data={propietarios}
          columns={columns}
          loading={loading}
          searchPlaceholder="Buscar por nombre, documento, email..."
          onSearch={handleSearch}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          emptyMessage="No hay propietarios registrados"
        />
      </div>

      {/* Modales */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Propietario"
        size="lg"
      >
        <div className="text-center py-8">
          <p>Formulario de creación de propietario</p>
          <p className="text-sm text-gray-500 mt-2">
            (Formulario será implementado en el siguiente paso)
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Propietario"
        size="lg"
      >
        <div className="text-center py-8">
          <p>Formulario de edición de propietario</p>
          <p className="text-sm text-gray-500 mt-2">
            (Formulario será implementado en el siguiente paso)
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Propietario"
        size="xl"
      >
        {selectedPropietario && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                <p className="text-lg font-semibold">
                  {selectedPropietario.nombre} {selectedPropietario.apellido}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Documento</label>
                <p className="text-lg">{selectedPropietario.tipoDocumento}: {selectedPropietario.numeroDocumento}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg">{selectedPropietario.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="text-lg">{selectedPropietario.telefono}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <EstadoBadge estado={selectedPropietario.estado} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha Registro</label>
                <p className="text-lg">{new Date(selectedPropietario.fechaCreacion).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Propiedades ({selectedPropietario._count.propiedades})</h4>
              <div className="grid gap-2">
                {selectedPropietario.propiedades.map((prop, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">
                        {prop.torre ? `${prop.torre}-${prop.numero}` : prop.numero}
                      </span>
                      <span className="text-gray-500 ml-2">({prop.tipo})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
