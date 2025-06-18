'use client'

import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Edit, Save, X, Eye, EyeOff, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Types
interface PerfilData {
  id: string
  nombre: string
  apellido: string
  tipoDocumento: string
  numeroDocumento: string
  email?: string
  telefono: string
  fechaNacimiento?: string
  parentesco: string
  fechaIngreso: string
  estado: string
  propiedad: {
    numero: string
    torre?: string
    tipo: string
    area: number
  }
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Simulate data fetch
  useEffect(() => {
    const fetchPerfil = async () => {
      setTimeout(() => {
        const data = {
          id: '1',
          nombre: 'Ana María',
          apellido: 'Rodríguez',
          tipoDocumento: 'CC',
          numeroDocumento: '12345678',
          email: 'ana.rodriguez@email.com',
          telefono: '+57 300 123 4567',
          fechaNacimiento: '1985-03-15',
          parentesco: 'PROPIETARIO',
          fechaIngreso: '2024-01-15',
          estado: 'ACTIVO',
          propiedad: {
            numero: '101',
            torre: 'A',
            tipo: 'APARTAMENTO',
            area: 85
          }
        }
        setPerfil(data)
        setFormData({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email || '',
          telefono: data.telefono,
          fechaNacimiento: data.fechaNacimiento || ''
        })
        setLoading(false)
      }, 1000)
    }

    fetchPerfil()
  }, [])

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    if (perfil) {
      setFormData({
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        email: perfil.email || '',
        telefono: perfil.telefono,
        fechaNacimiento: perfil.fechaNacimiento || ''
      })
    }
    setEditing(false)
  }

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (perfil) {
        setPerfil({
          ...perfil,
          ...formData
        })
      }
      setEditing(false)
      alert('Perfil actualizado exitosamente')
    } catch (error) {
      alert('Error al actualizar el perfil')
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres')
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowPasswordForm(false)
      alert('Contraseña actualizada exitosamente')
    } catch (error) {
      alert('Error al actualizar la contraseña')
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="text-center py-8">
        <p>Error al cargar el perfil</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
        </div>
        {!editing && (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </h3>
              {editing && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Guardar
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{perfil.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{perfil.apellido}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                <p className="text-lg text-gray-600">{perfil.tipoDocumento}: {perfil.numeroDocumento}</p>
                <p className="text-xs text-gray-500">No editable</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{perfil.email || 'No registrado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{perfil.telefono}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                {editing ? (
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-900">
                    {perfil.fechaNacimiento ? new Date(perfil.fechaNacimiento).toLocaleDateString('es-ES') : 'No registrada'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Key className="h-5 w-5" />
                Seguridad
              </h3>
              {!showPasswordForm && (
                <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                  Cambiar Contraseña
                </Button>
              )}
            </div>

            {showPasswordForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handlePasswordChange}>
                    Actualizar Contraseña
                  </Button>
                  <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                Tu contraseña fue actualizada por última vez hace 30 días. Te recomendamos cambiarla periódicamente para mantener tu cuenta segura.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mi Propiedad</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Número</label>
                <p className="font-medium">
                  {perfil.propiedad.torre ? `${perfil.propiedad.torre}-${perfil.propiedad.numero}` : perfil.propiedad.numero}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tipo</label>
                <p className="font-medium">{perfil.propiedad.tipo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Área</label>
                <p className="font-medium">{perfil.propiedad.area} m²</p>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Residencia</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Parentesco</label>
                <div className="mt-1">
                  <Badge variant="default">{perfil.parentesco}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Fecha de Ingreso</label>
                <p className="font-medium">{new Date(perfil.fechaIngreso).toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Estado</label>
                <div className="mt-1">
                  <Badge variant={perfil.estado === 'ACTIVO' ? 'default' : 'secondary'}>
                    {perfil.estado}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}