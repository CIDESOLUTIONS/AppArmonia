import { Building2, Users, DollarSign, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Propiedades',
      value: '28',
      change: '+2',
      changeType: 'positive',
      icon: Building2,
    },
    {
      title: 'Residentes Activos',
      value: '67',
      change: '+5',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Cartera Pendiente',
      value: '$2.4M',
      change: '-8%',
      changeType: 'negative',
      icon: DollarSign,
    },
    {
      title: 'PQRs Pendientes',
      value: '3',
      change: '0',
      changeType: 'neutral',
      icon: AlertCircle,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen general del conjunto residencial</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {stat.change} este mes
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.changeType === 'positive' ? 'bg-green-100 text-green-600' :
                stat.changeType === 'negative' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
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
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
              Registrar nueva propiedad
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
              Convocar asamblea
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
              Generar reporte financiero
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
              Enviar comunicado
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Pago recibido - Apto 101</span>
              <span className="text-gray-400 ml-auto">hace 2h</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Nueva PQR - Mantenimiento</span>
              <span className="text-gray-400 ml-auto">hace 4h</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Reserva cancelada - Salón social</span>
              <span className="text-gray-400 ml-auto">ayer</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Nuevo residente - Apto 205</span>
              <span className="text-gray-400 ml-auto">hace 2 días</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos Mensuales</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico de ingresos (placeholder)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de PQRs</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico de PQRs (placeholder)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
