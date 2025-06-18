import { Building2, Users, UserCheck, BarChart3, Calendar, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
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
          <p className="text-sm text-gray-600 mt-1">Panel Administrador</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <BarChart3 className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/propiedades" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Building2 className="h-5 w-5 mr-3" />
                Propiedades
              </Link>
            </li>
            <li>
              <Link href="/admin/propietarios" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <UserCheck className="h-5 w-5 mr-3" />
                Propietarios
              </Link>
            </li>
            <li>
              <Link href="/admin/residentes" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Users className="h-5 w-5 mr-3" />
                Residentes
              </Link>
            </li>
            <li>
              <Link href="/admin/asambleas" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Calendar className="h-5 w-5 mr-3" />
                Asambleas
              </Link>
            </li>
            <li>
              <Link href="/admin/configuracion" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5 mr-3" />
                Configuración
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
              Conjunto Villa Armonía
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin: Carlos López</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                CL
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
