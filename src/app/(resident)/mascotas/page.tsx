'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Heart, Dog, Cat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'

// Types
interface Mascota {
  id: string
  nombre: string
  especie: string
  raza?: string
  color: string
  edad: number
  peso: number
  chip?: string
  vacunas: boolean
  fechaRegistro: string
  estado: string
}

// Pet species icons
const getPetIcon = (especie: string) => {
  switch (especie.toUpperCase()) {
    case 'PERRO':
      return <Dog className="h-5 w-5" />
    case 'GATO':
      return <Cat className="h-5 w-5" />
    default:
      return <Heart className="h-5 w-5" />
  }
}

// Species badge
const EspecieBadge = ({ especie }: { especie: string }) => {
  const variants = {
    'PERRO': 'default',
    'GATO': 'secondary',
    'AVE': 'outline',
    'PEZ': 'outline',
    'REPTIL': 'outline',
    'OTRO': 'outline'
  } as const

  return (
    <Badge variant={variants[especie as keyof typeof variants] || 'outline'}>
      {especie}
    </Badge>
  )
}

export default function MascotasPage() {
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Simulate data fetch
  useEffect(() => {
    const fetchMascotas = async () => {
      setTimeout(() => {
        setMascotas([
          {
            id: '1',
            nombre: 'Max',
            especie: 'PERRO',
            raza: 'Golden Retriever',
            color: 'Dorado',
            edad: 3,
            peso: 28.5,
            chip: 'CHI123456789',
            vacunas: true,
            fechaRegistro: '2024-01-15',
            estado: 'ACTIVO'
          },
          {
            id: '2',
            nombre: 'Luna',
            especie: 'GATO',
            raza: 'Persa',
            color: 'Blanco',
            edad: 2,
            peso: 4.2,
            chip: 'CHI987654321',
            vacunas: true,
            fechaRegistro: '2024-03-10',
            estado: 'ACTIVO'
          }
        ])
        setLoading(false)
      }, 1000)
    }

    fetchMascotas()
  }, [])

  const handleCreate = () => {
    setIsCreateModalOpen(true)
  }

  const handleEdit = (mascota: Mascota) => {
    setSelectedMascota(mascota)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (mascota: Mascota) => {
    if (confirm(`¿Estás seguro de dar de baja a ${mascota.nombre}?`)) {
      setMascotas(prev => prev.filter(m => m.id !== mascota.id))
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Mascotas</h1>
          <p className="text-gray-600">Gestiona las mascotas registradas en tu propiedad</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Registrar Mascota
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{mascotas.length}</div>
          <div className="text-sm text-gray-600">Total Mascotas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {mascotas.filter(m => m.especie === 'PERRO').length}
          </div>
          <div className="text-sm text-gray-600">Perros</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {mascotas.filter(m => m.especie === 'GATO').length}
          </div>
          <div className="text-sm text-gray-600">Gatos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {mascotas.filter(m => m.vacunas).length}
          </div>
          <div className="text-sm text-gray-600">Con Vacunas</div>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mascotas.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes mascotas registradas</h3>
            <p className="text-gray-600 mb-4">Registra tu primera mascota para comenzar</p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Mascota
            </Button>
          </div>
        ) : (
          mascotas.map((mascota) => (
            <div key={mascota.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getPetIcon(mascota.especie)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{mascota.nombre}</h3>
                    <p className="text-sm text-gray-600">{mascota.raza || mascota.especie}</p>
                  </div>
                </div>
                <EspecieBadge especie={mascota.especie} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium">{mascota.color}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Edad:</span>
                  <span className="font-medium">{mascota.edad} año{mascota.edad !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Peso:</span>
                  <span className="font-medium">{mascota.peso} kg</span>
                </div>
                {mascota.chip && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Chip:</span>
                    <span className="font-medium text-xs">{mascota.chip}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vacunas:</span>
                  <Badge variant={mascota.vacunas ? 'default' : 'destructive'} className="text-xs">
                    {mascota.vacunas ? 'Al día' : 'Pendiente'}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(mascota)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(mascota)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vaccination Reminder */}
      {mascotas.some(m => !m.vacunas) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Heart className="h-5 w-5" />
            <h3 className="font-medium">Recordatorio de Vacunación</h3>
          </div>
          <p className="text-yellow-700 mt-1">
            Algunas de tus mascotas tienen vacunas pendientes. Es importante mantener al día las vacunas para la salud de tu mascota y la seguridad del conjunto.
          </p>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrar Nueva Mascota"
        size="lg"
      >
        <div className="text-center py-8">
          <p>Formulario de registro de mascota</p>
          <p className="text-sm text-gray-500 mt-2">
            (Formulario será implementado en el siguiente paso)
          </p>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Mascota"
        size="lg"
      >
        <div className="text-center py-8">
          <p>Formulario de edición de mascota</p>
          <p className="text-sm text-gray-500 mt-2">
            (Formulario será implementado en el siguiente paso)
          </p>
        </div>
      </Modal>
    </div>
  )
}