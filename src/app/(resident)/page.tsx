'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, Calendar, AlertCircle, CheckCircle, User, Car, Heart, Edit, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Tipos
interface ResidentData {
  id: string
  nombre: string
  apellido: string
  email?: string
  telefono: string
  propiedad: {
    numero: string
    torre?: string
    tipo: string
    area: number
  }
  vehiculos: Array<{
    id: string
    placa: string
    marca: string
    modelo: string
    tipo: string
  }>
  mascotas: Array<{
    id: string
    nombre: string
    especie: string
    raza?: string
  }>
  cuotasPendientes: {
    total: number
    proximoVencimiento: string
  }
  pqrsActivos: number
  reservasProximas: Array<{
    servicio: string
    fecha: string
    hora: string
  }>
}

export default function ResidentDashboard() {
  const [residentData, setResidentData] = useState<ResidentData | null>(null)
  const [loading, setLoading] = useState(true)

  // Datos simulados (en producción vendría de la API)
  useEffect(() => {
    const fetchResidentData = async () => {
      // Simular llamada a API
      setTimeout(() => {
        setResidentData({
          id: '1',
          nombre: 'Ana María',
          apellido: 'Rodríguez',
          email: 'ana.rodriguez@email.com',
          telefono: '+57 300 123 4567',
          propiedad: {
            numero: '101',
            torre: 'A',
            tipo: 'APARTAMENTO',
            area: 85
          },
          vehiculos: [
            {
              id: '1',
              placa: 'ABC123',
              marca: 'Toyota',
              modelo: 'Corolla',
              tipo: 'AUTOMOVIL'
            }
          ],
          mascotas: [
            {
              id: '1',
              nombre: 'Max',
              especie: 'PERRO',
              raza: 'Golden Retriever'
            }
          ],
          cuotasPendientes: {
            total: 450000,
            proximoVencimiento: '2024-06-15'
          },
          pqrsActivos: 1,
          reservasProximas: [
            {
              servicio: 'Salón Social',
              fecha: '2024-06-25',
              hora: '19:00'
            },
            {
              servicio: 'Cancha de Fútbol',
              fecha: '2024-06-30',
              hora: '08:00'
            }
          ]
        })
        setLoading(false)
      }, 1000)
    }

    fetchResidentData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!residentData) {
    return (
      <div className="text-center py-8">
        <p>Error al cargar los datos del residente</p>
      </div>
    )
  }

  const stats = [
    {
      title: 'Saldo Pendiente',
      value: `$${residentData.cuotasPendientes.total.toLocaleString()}`,
      status: 'warning',
      icon: DollarSign,
    },
    {
      title: 'Próximo Vencimiento',
      value: new Date(residentData.cuotasPendientes.proximoVencimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      status: 'info',
      icon: Calendar,
    },
    {
      title: 'PQRs Activos',
      value: residentData.pqrsActivos.toString(),
      status: 'warning',
      icon: AlertCircle,
    },
    {
      title: 'Reservas del Mes',
      value: residentData.reservasProximas.length.toString(),
      status: 'success',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Propiedad</h1>
          <p className="text-gray-600">
            {residentData.propiedad.torre ? `${residentData.propiedad.torre}-${residentData.propiedad.numero}` : residentData.propiedad.numero} 
            • {residentData.propiedad.tipo} • {residentData.propiedad.area} m²
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Editar Perfil
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.status === 'success' ? 'bg-green-100 text-green-600' :
                stat.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                stat.status === 'info' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Personal Info Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </h3>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="font-medium">{residentData.email || 'No registrado'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Teléfono</div>
              <div className="font-medium">{residentData.telefono}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles and Pets */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Car className="h-5 w-5" />
              Mis Vehículos ({residentData.vehiculos.length})
            </h3>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {residentData.vehiculos.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tienes vehículos registrados</p>
            ) : (
              residentData.vehiculos.map((vehiculo) => (
                <div key={vehiculo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{vehiculo.placa}</div>
                    <div className="text-sm text-gray-600">{vehiculo.marca} {vehiculo.modelo}</div>
                  </div>
                  <Badge variant="outline">{vehiculo.tipo}</Badge>
                </div>
              ))
            )}
            <Button variant="outline" size="sm" className="w-full mt-2">
              + Agregar Vehículo
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Mis Mascotas ({residentData.mascotas.length})
            </h3>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {residentData.mascotas.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tienes mascotas registradas</p>
            ) : (
              residentData.mascotas.map((mascota) => (
                <div key={mascota.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{mascota.nombre}</div>
                    <div className="text-sm text-gray-600">{mascota.raza || mascota.especie}</div>
                  </div>
                  <Badge variant="outline">{mascota.especie}</Badge>
                </div>
              ))
            )}
            <Button variant="outline" size="sm" className="w-full mt-2">
              + Agregar Mascota
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              💳 Pagar cuotas pendientes
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📅 Reservar área común
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📝 Crear PQR
            </Button>
            <Button variant="outline" className="w-full justify-start">
              👥 Registrar visitante
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Cuenta</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Cuota Administración Jun</span>
              <span className="text-red-600 font-medium">$350,000</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Cuota Extraordinaria</span>
              <span className="text-red-600 font-medium">$100,000</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Multa Ruido</span>
              <span className="text-red-600 font-medium">$50,000</span>
            </div>
            <div className="flex justify-between items-center py-2 font-semibold text-lg">
              <span>Total Pendiente</span>
              <span className="text-red-600">$500,000</span>
            </div>
            <Button className="w-full mt-4">
              Pagar Ahora
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Pagos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-900 font-medium">Cuota Mayo 2024</span>
                <div className="text-gray-500">15 May 2024</div>
              </div>
              <span className="text-green-600 font-medium">$350,000</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-900 font-medium">Cuota Abril 2024</span>
                <div className="text-gray-500">10 Abr 2024</div>
              </div>
              <span className="text-green-600 font-medium">$350,000</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-900 font-medium">Cuota Marzo 2024</span>
                <div className="text-gray-500">12 Mar 2024</div>
              </div>
              <span className="text-green-600 font-medium">$350,000</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Reservas</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900">Salón Social</div>
              <div className="text-sm text-blue-700">25 Jun 2024 • 7:00 PM - 11:00 PM</div>
              <div className="text-sm text-blue-600">Cumpleaños familiar</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900">Cancha de Fútbol</div>
              <div className="text-sm text-green-700">30 Jun 2024 • 8:00 AM - 10:00 AM</div>
              <div className="text-sm text-green-600">Partido amigos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
