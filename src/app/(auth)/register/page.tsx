'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rol: 'ADMIN_CONJUNTO' // Default role for registration
        }),
      });

      if (response.ok) {
        alert('Registro exitoso. Revisa tu email para verificar la cuenta.');
        window.location.href = '/auth/login';
      } else {
        const error = await response.json();
        alert(error.message || 'Error en el registro');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
        <p className="text-gray-600">Comienza tu prueba gratuita</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo
          </label>
          <input
            id="nombreCompleto"
            type="text"
            required
            value={formData.nombreCompleto}
            onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Tu nombre completo"
          />
        </div>

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
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono (Opcional)
          </label>
          <input
            id="telefono"
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="+57 300 123 4567"
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
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Confirma tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-start">
          <input
            id="acceptTerms"
            type="checkbox"
            required
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
          />
          <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-600">
            Acepto los{' '}
            <a href="#" className="text-primary hover:text-primary/80">
              términos y condiciones
            </a>{' '}
            y la{' '}
            <a href="#" className="text-primary hover:text-primary/80">
              política de privacidad
            </a>
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full py-3 text-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      {/* Benefits */}
      <div className="mt-8 p-4 bg-green-50 rounded-lg">
        <h3 className="text-sm font-medium text-green-900 mb-2">✨ Tu prueba gratuita incluye:</h3>
        <ul className="text-xs text-green-800 space-y-1">
          <li>• Hasta 25 unidades residenciales</li>
          <li>• Gestión completa de propiedades</li>
          <li>• Portal de comunicaciones</li>
          <li>• Sin tarjeta de crédito requerida</li>
        </ul>
      </div>
    </div>
  );
}
