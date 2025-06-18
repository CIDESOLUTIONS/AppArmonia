import { DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResidentDashboard() {
  const stats = [
    {
      title: 'Saldo Pendiente',
      value: '$450,000',
      status: 'warning',
      icon: DollarSign,
    },
    {
      title: 'Próximo Vencimiento',
      value: '15 Jun',
      status: 'info',
      icon: Calendar,
    },
    {
      title: 'PQRs Activos',
      value: '1',
      status: 'warning',
      icon: AlertCircle,
    },
    {
      title: 'Reservas del Mes',
      value: '2',
      status: 'success',
      icon: CheckCircle,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Propiedad</h1>
        <p className="text-gray-600">Información y estado de tu apartamento</p>
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border text-primary border-primary">
              💳 Pagar cuotas pendientes
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
              📅 Reservar área común
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
              📝 Crear PQR
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
              👥 Registrar visitante
            </button>
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
