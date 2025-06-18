import { Users, Package, Clock, AlertCircle } from 'lucide-react';

export default function ReceptionDashboard() {
  const stats = [
    {
      title: 'Visitantes Actuales',
      value: '7',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Correspondencia Pendiente',
      value: '12',
      icon: Package,
      color: 'yellow',
    },
    {
      title: 'Horas en Turno',
      value: '4:30',
      icon: Clock,
      color: 'green',
    },
    {
      title: 'Incidentes Hoy',
      value: '1',
      icon: AlertCircle,
      color: 'red',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Control de Acceso</h1>
        <p className="text-gray-600">Panel de control para recepción y vigilancia</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                'bg-red-100 text-red-600'
              }`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border text-primary border-primary">
              👤 Registrar visitante
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
              📦 Registrar correspondencia
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
              🚨 Reportar incidente
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
              📝 Actualizar minuta
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitantes en el Conjunto</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-blue-900">Juan Pérez</div>
                <div className="text-sm text-blue-700">Apto 101 • Ingresó 2:30 PM</div>
              </div>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Activo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-blue-900">María García</div>
                <div className="text-sm text-blue-700">Apto 205 • Ingresó 1:15 PM</div>
              </div>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Activo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-blue-900">Servicio Técnico</div>
                <div className="text-sm text-blue-700">Apto 301 • Ingresó 11:00 AM</div>
              </div>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Correspondencia Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Paquete Amazon</div>
                <div className="text-sm text-gray-600">Apto 101 • 3:15 PM</div>
              </div>
              <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Pendiente</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Carta Banco</div>
                <div className="text-sm text-gray-600">Apto 205 • 2:45 PM</div>
              </div>
              <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Pendiente</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Mercado Libre</div>
                <div className="text-sm text-gray-600">Apto 301 • 1:30 PM</div>
              </div>
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Entregado</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Minuta del Turno</h3>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-1">8:00 AM - Inicio de turno</div>
              <div className="text-sm text-gray-600">Recepción de correspondencia matutina. Todo normal.</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-1">10:30 AM - Mantenimiento</div>
              <div className="text-sm text-gray-600">Técnico de ascensores realizó revisión preventiva Torre A.</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-sm font-medium text-red-900 mb-1">2:00 PM - Incidente menor</div>
              <div className="text-sm text-red-700">Ruido excesivo Apto 205. Se habló con el residente.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
