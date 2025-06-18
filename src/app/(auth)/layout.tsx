import { Building2 } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-purple-600 to-blue-600 text-white">
        <div className="flex flex-col justify-center px-12">
          <div className="mb-8">
            <Link href="/" className="flex items-center">
              <Building2 className="h-10 w-10 mr-4" />
              <span className="text-3xl font-bold">Armonía</span>
            </Link>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Gestión Residencial Inteligente
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Conecta administradores, residentes y personal en una sola plataforma. 
            Simplifica la gestión diaria de tu conjunto residencial.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-4"></div>
              <span>Gestión de propiedades y residentes</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-4"></div>
              <span>Asambleas y votaciones digitales</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-4"></div>
              <span>Finanzas y reportes automáticos</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-4"></div>
              <span>Comunicación integrada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center">
              <Building2 className="h-8 w-8 text-primary mr-3" />
              <span className="text-2xl font-bold text-primary">Armonía</span>
            </Link>
          </div>
          
          {children}
          
          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
