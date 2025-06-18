'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect based on user role
        window.location.href = data.user?.rol === 'SUPER_ADMIN' ? '/admin' : 
                               data.user?.rol === 'ADMIN_CONJUNTO' ? '/admin' :
                               data.user?.rol.includes('RECEPCION') || data.user?.rol.includes('VIGILANCIA') ? '/reception' :
                               '/resident';
      } else {
        const error = await response.json();
        alert(error.message || 'Error en el inicio de sesión');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
        <p className="text-gray-600">Accede a tu panel de administración</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.remember}
              onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-600">Recordarme</span>
          </label>
          <Link 
            href="/auth/forgot-password"
            className="text-sm text-primary hover:text-primary/80"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button 
          type="submit" 
          className="w-full py-3 text-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">
            Regístrate aquí
          </Link>
        </p>
      </div>

      {/* Demo credentials */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">🧪 Credenciales de prueba:</h3>
        <div className="text-xs text-blue-800 space-y-1">
          <div><strong>Admin:</strong> admin@villaarmonia.com</div>
          <div><strong>Residente:</strong> residente1@email.com</div>
          <div><strong>Recepción:</strong> recepcion@villaarmonia.com</div>
          <div><strong>Contraseña:</strong> 123456</div>
        </div>
      </div>
    </div>
  );
}
