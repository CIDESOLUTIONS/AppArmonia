'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Car, Truck, Bike } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'

// Types
interface Vehiculo {
  id: string
  placa: string
  marca: string
  modelo: string
  color: string
  tipo: string
  ano: number
  fechaRegistro: string
  estado: string
}

// Vehicle type icons
const getVehicleIcon = (tipo: string) => {
  switch (tipo) {
    case 'AUTOMOVIL':
      return <Car className="h-5 w-5" />
    case 'MOTOCICLETA':
      return <Bike className="h-5 w-5" />
    case 'CAMIONETA':
      return <Truck className="h-5 w-5" />
    default:
      return <Car className="h-5 w-5" />
  }
}

// Vehicle type badge
const TipoBadge = ({ tipo }: { tipo: string }) => {
  const variants = {
    'AUTOMOVIL': 'default',
    'MOTOCICLETA': 'secondary',
    'CAMIONETA': 'outline'
  } as const

  return (
    <Badge variant={variants[tipo as keyof typeof variants] || 'default'}>
      {tipo}
    </Badge>
  )
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Simulate data fetch
  useEffect(() => {
    const fetchVehiculos = async () => {
      setTimeout(() => {
        setVehiculos([
          {
            id: '1',
            placa: 'ABC123',
            marca: 'Toyota',
            modelo: 'Corolla',
            color: 'Blanco',
            tipo: 'AUTOMOVIL',
            ano: 2020,
            fechaRegistro: '2024-01-15',
            estado: 'ACTIVO'
          },
          {
            id: '2',
            placa: 'XYZ789',
            marca: 'Honda',
            modelo: 'CBR600',
            color: 'Negro',
            tipo: 'MOTOCICLETA',
            ano: 2022,
            fechaRegistro: '2024-03-10',
            estado: 'ACTIVO'
          }
        ])
        setLoading(false)
      }, 1000)
    }

    fetchVehiculos()
  }, [])

  const handleCreate = () => {
    setIsCreateModalOpen(true)
  }

  const handleEdit = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (vehiculo: Vehiculo) => {
    if (confirm(`¿Estás seguro de eliminar el vehículo ${vehiculo.placa}?`)) {
      setVehiculos(prev => prev.filter(v => v.id !== vehiculo.id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Vehículos</h1>
          <p className="text-gray-600">Gestiona los vehículos registrados en tu propiedad</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Registrar Vehículo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{vehiculos.length}</div>
          <div className="text-sm text-gray-600">Total Vehículos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {vehiculos.filter(v => v.tipo === 'AUTOMOVIL').length}
          </div>
          <div className="text-sm text-gray-600">Automóviles</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {vehiculos.filter(v => v.tipo === 'MOTOCICLETA').length}
          </div>
          <div className="text-sm text-gray-600">Motocicletas</div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehiculos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes vehículos registrados</h3>
            <p className="text-gray-600 mb-4">Registra tu primer vehículo para comenzar</p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Vehículo
            </Button>
          </div>
        ) : (
          vehiculos.map((vehiculo) => (
            <div key={vehiculo.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getVehicleIcon(vehiculo.tipo)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{vehiculo.placa}</h3>
                    <p className="text-sm text-gray-600">{vehiculo.marca} {vehiculo.modelo}</p>
                  </div>
                </div>
                <TipoBadge tipo={vehiculo.tipo} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium">{vehiculo.color}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Año:</span>
                  <span className="font-medium">{vehiculo.ano}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Registrado:</span>
                  <span className="font-medium">
                    {new Date(vehiculo.fechaRegistro).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(vehiculo)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(vehiculo)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrar Nuevo Vehículo"
        size="lg"
      >
        <div className="text-center py-8">
          <p>Formulario de registro de vehículo</p>
          <p className="text-sm text-gray-500 mt-2">
            (Formulario será implementado en el siguiente paso)
          </p>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Vehículo"
        size="lg"
      >
        <div className="text-center py-8">
          <p>Formulario de edición de vehículo</p>
          <p className="text-sm text-gray-500 mt-2">
            (Formulario será implementado en el siguiente paso)
          </p>
        </div>
      </Modal>
    </div>
  )
}