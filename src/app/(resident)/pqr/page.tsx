'use client'

import React, { useState, useEffect } from 'react'
import { Plus, MessageSquare, Clock, CheckCircle, Star, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'

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
  respuesta?: string
  calificacion?: number
  comentarioCalificacion?: string
}

interface FormData {
  tipo: string
  categoria: string
  asunto: string
  descripcion: string
  anonimo: boolean
}

const TIPOS_PQR = [
  { value: 'PETICION', label: 'Petición', description: 'Solicitud de información o servicios' },
  { value: 'QUEJA', label: 'Queja', description: 'Expresión de insatisfacción' },
  { value: 'RECLAMO', label: 'Reclamo', description: 'Solicitud de solución a un problema' },
  { value: 'SUGERENCIA', label: 'Sugerencia', description: 'Propuesta de mejora' }
]

const CATEGORIAS = [
  { value: 'MANTENIMIENTO', label: 'Mantenimiento', icon: '🔧' },
  { value: 'SEGURIDAD', label: 'Seguridad', icon: '🛡️' },
  { value: 'RUIDO', label: 'Ruido', icon: '🔊' },
  { value: 'ASEO', label: 'Aseo', icon: '🧹' },
  { value: 'ADMINISTRACION', label: 'Administración', icon: '📋' },
  { value: 'AREAS_COMUNES', label: 'Áreas Comunes', icon: '🏊' },
  { value: 'SERVICIOS_PUBLICOS', label: 'Servicios Públicos', icon: '⚡' },
  { value: 'VECINOS', label: 'Vecinos', icon: '👥' },
  { value: 'OTRO', label: 'Otro', icon: '❓' }
]

// Componentes
const EstadoBadge = ({ estado }: { estado: string }) => {
  const variants = {
    'RECIBIDO': { color: 'bg-yellow-100 text-yellow-800', icon: '📥' },
    'EN_PROCESO': { color: 'bg-blue-100 text-blue-800', icon: '⏳' },
    'RESUELTO': { color: 'bg-green-100 text-green-800', icon: '✅' },
    'CERRADO': { color: 'bg-gray-100 text-gray-800', icon: '🔒' }
  } as const
  
  const variant = variants[estado as keyof typeof variants] || variants['RECIBIDO']
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${variant.color}`}>
      <span>{variant.icon}</span>
      {estado.replace('_', ' ')}
    </span>
  )
}

const StarRating = ({ rating, onRating }: { rating: number, onRating: (rating: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => onRating(star)}
        className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
      >
        <Star fill={star <= rating ? 'currentColor' : 'none'} />
      </button>
    ))}
  </div>
)

export default function ResidentPQRPage() {
  const [pqrs, setPqrs] = useState<PQR[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedPQR, setSelectedPQR] = useState<PQR | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  
  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    tipo: '',
    categoria: '',
    asunto: '',
    descripcion: '',
    anonimo: false
  })
  
  const [rating, setRating] = useState(0)
  const [comentarioCalificacion, setComentarioCalificacion] = useState('')

  // Datos simulados
  useEffect(() => {
    setTimeout(() => {
      setPqrs([
        {
          id: '1',
          numero: 'PQR-2024-001',
          tipo: 'QUEJA',
          categoria: 'RUIDO',
          asunto: 'Ruido excesivo en las noches',
          descripcion: 'Los vecinos del apartamento 203 hacen mucho ruido después de las 10pm.',
          estado: 'RESUELTO',
          prioridad: 'MEDIA',
          fechaCreacion: '2024-06-01T10:00:00Z',
          fechaRespuesta: '2024-06-03T15:30:00Z',
          respuesta: 'Hemos hablado con los residentes y se comprometieron a respetar los horarios de silencio. Se realizará seguimiento.'
        },
        {
          id: '2',
          numero: 'PQR-2024-015',
          tipo: 'PETICION',
          categoria: 'AREAS_COMUNES',
          asunto: 'Solicitud de mantenimiento en la piscina',
          descripcion: 'La piscina presenta problemas en el sistema de filtrado.',
          estado: 'EN_PROCESO',
          prioridad: 'ALTA',
          fechaCreacion: '2024-06-10T14:30:00Z'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleCreatePQR = async () => {
    try {
      const response = await fetch('/api/pqr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Recargar PQRs
        setIsCreateModalOpen(false)
        setFormData({ tipo: '', categoria: '', asunto: '', descripcion: '', anonimo: false })
        alert('PQR creado exitosamente')
      }
    } catch (error) {
      console.error('Error creating PQR:', error)
      alert('Error al crear PQR')
    }
  }

  const handleSubmitRating = async () => {
    if (!selectedPQR) return

    try {
      const response = await fetch(`/api/pqr/${selectedPQR.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calificacion: rating,
          comentarioCalificacion,
          estado: 'CERRADO'
        })
      })

      if (response.ok) {
        setIsRatingModalOpen(false)
        setRating(0)
        setComentarioCalificacion('')
        alert('Calificación enviada exitosamente')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    }
  }

  const getDaysAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
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
          <h1 className="text-2xl font-bold text-gray-900">Mis PQRs</h1>
          <p className="text-gray-600">Peticiones, Quejas y Reclamos</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear PQR
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{pqrs.length}</div>
              <div className="text-sm text-gray-600">Total PQRs</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {pqrs.filter(p => ['RECIBIDO', 'EN_PROCESO'].includes(p.estado)).length}
              </div>
              <div className="text-sm text-gray-600">En Proceso</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {pqrs.filter(p => ['RESUELTO', 'CERRADO'].includes(p.estado)).length}
              </div>
              <div className="text-sm text-gray-600">Resueltos</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {pqrs.filter(p => p.calificacion).length}
              </div>
              <div className="text-sm text-gray-600">Calificados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de PQRs */}
      <div className="space-y-4">
        {pqrs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes PQRs registrados</h3>
            <p className="text-gray-600 mb-4">Crea tu primer PQR para comenzar</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear PQR
            </Button>
          </div>
        ) : (
          pqrs.map((pqr) => (
            <div key={pqr.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{pqr.numero}</h3>
                    <EstadoBadge estado={pqr.estado} />
                    <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                      {CATEGORIAS.find(c => c.value === pqr.categoria)?.icon} {pqr.categoria.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{pqr.asunto}</h4>
                  <p className="text-gray-600 mb-3">{pqr.descripcion}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Creado hace {getDaysAgo(pqr.fechaCreacion)} días</span>
                    {pqr.fechaRespuesta && (
                      <span>Respondido hace {getDaysAgo(pqr.fechaRespuesta)} días</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPQR(pqr)
                      setIsDetailModalOpen(true)
                    }}
                  >
                    Ver Detalles
                  </Button>
                  
                  {pqr.estado === 'RESUELTO' && !pqr.calificacion && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedPQR(pqr)
                        setIsRatingModalOpen(true)
                      }}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Calificar
                    </Button>
                  )}
                </div>
              </div>
              
              {pqr.respuesta && (
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Respuesta:</h5>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{pqr.respuesta}</p>
                </div>
              )}
              
              {pqr.calificacion && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Tu calificación:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= pqr.calificacion! ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill={star <= pqr.calificacion! ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  {pqr.comentarioCalificacion && (
                    <p className="text-sm text-gray-600 mt-1">"{pqr.comentarioCalificacion}"</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Crear PQR */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo PQR"
        size="lg"
      >
        <div className="space-y-6">
          {/* Tipo de PQR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de PQR</label>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS_PQR.map((tipo) => (
                <div
                  key={tipo.value}
                  onClick={() => setFormData(prev => ({ ...prev, tipo: tipo.value }))}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.tipo === tipo.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium">{tipo.label}</h4>
                  <p className="text-sm text-gray-600">{tipo.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Categoría</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIAS.map((categoria) => (
                <button
                  key={categoria.value}
                  onClick={() => setFormData(prev => ({ ...prev, categoria: categoria.value }))}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    formData.categoria === categoria.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{categoria.icon}</div>
                  <div className="text-sm font-medium">{categoria.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
            <input
              type="text"
              value={formData.asunto}
              onChange={(e) => setFormData(prev => ({ ...prev, asunto: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Resumen breve del tema"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.asunto.length}/200 caracteres</p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
              placeholder="Describe detalladamente tu solicitud, queja o reclamo..."
            />
          </div>

          {/* Anónimo */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonimo"
              checked={formData.anonimo}
              onChange={(e) => setFormData(prev => ({ ...prev, anonimo: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="anonimo" className="text-sm text-gray-700">
              Enviar de forma anónima
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleCreatePQR}
              disabled={!formData.tipo || !formData.categoria || !formData.asunto || !formData.descripcion}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar PQR
            </Button>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Detalles */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalles del PQR"
        size="lg"
      >
        {selectedPQR && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Número</label>
                <p className="text-lg font-semibold">{selectedPQR.numero}</p>
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
                <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded">{selectedPQR.respuesta}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Calificación */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title="Calificar Respuesta"
        size="md"
      >
        <div className="space-y-4">
          <p>¿Qué tal te pareció la respuesta a tu PQR?</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
            <StarRating rating={rating} onRating={setRating} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario (opcional)</label>
            <textarea
              value={comentarioCalificacion}
              onChange={(e) => setComentarioCalificacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
              placeholder="Comparte tu experiencia..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmitRating} disabled={rating === 0}>
              Enviar Calificación
            </Button>
            <Button variant="outline" onClick={() => setIsRatingModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}