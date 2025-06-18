import { Building2, Home, DollarSign, Calendar, MessageSquare, Car, Heart, User, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center">
            <Building2 className="h-8 w-8 text-primary mr-3" />
            <span className="text-xl font-bold text-primary">Armonía</span>
          </Link>
          <p className="text-sm text-gray-600 mt-1">Portal Residente</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/resident" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Home className="h-5 w-5 mr-3" />
                Mi Propiedad
              </Link>
            </li>
            <li>
              <Link href="/resident/pagos" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <DollarSign className="h-5 w-5 mr-3" />
                Pagos y Cuotas
              </Link>
            </li>
            <li>
              <Link href="/resident/reservas" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Calendar className="h-5 w-5 mr-3" />
                Reservas
              </Link>
            </li>
            <li>
              <Link href="/resident/vehiculos" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Car className="h-5 w-5 mr-3" />
                Mis Vehículos
              </Link>
            </li>
            <li>
              <Link href="/resident/mascotas" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Heart className="h-5 w-5 mr-3" />
                Mis Mascotas
              </Link>
            </li>
            <li>
              <Link href="/resident/pqr" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <MessageSquare className="h-5 w-5 mr-3" />
                PQR
              </Link>
            </li>
            <li>
              <Link href="/resident/perfil" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <User className="h-5 w-5 mr-3" />
                Mi Perfil
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full">
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Apartamento 101 - Torre A
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Ana María Rodríguez</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                AR
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
