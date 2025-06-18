import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, Star, Users, Shield, BarChart3, Calendar, Building2, Smartphone } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-primary mr-3" />
              <span className="text-xl font-bold text-primary">Armonía</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary">Funcionalidades</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary">Planes</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary">Testimonios</a>
              <a href="#blog" className="text-gray-600 hover:text-primary">Blog</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Prueba Gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/10 via-purple-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transforma la Gestión de tu{' '}
              <span className="text-gradient">Conjunto Residencial</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Plataforma integral que conecta administradores, residentes y personal. 
              Simplifica la administración, mejora la comunicación y democratiza las decisiones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-4">
                  Comenzar Prueba Gratuita
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Ver Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ✨ Gratis hasta 25 unidades • Sin tarjeta de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en una plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gestiona eficientemente todos los aspectos de tu conjunto residencial
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Gestión de Residentes",
                description: "Administra propietarios, residentes, vehículos y mascotas en un solo lugar"
              },
              {
                icon: BarChart3,
                title: "Finanzas Integrales",
                description: "Presupuestos, cuotas, pagos y reportes financieros automatizados"
              },
              {
                icon: Calendar,
                title: "Asambleas Digitales",
                description: "Convocatorias, votaciones en tiempo real y actas digitales"
              },
              {
                icon: Shield,
                title: "Seguridad y Control",
                description: "Registro de visitantes, correspondencia y minutas de vigilancia"
              },
              {
                icon: Building2,
                title: "Servicios Comunes",
                description: "Reserva de espacios, calendario de disponibilidad y estadísticas"
              },
              {
                icon: Smartphone,
                title: "Comunicación Integrada",
                description: "Citofonía virtual, notificaciones y tablón de anuncios"
              }
            ].map((feature, index) => (
              <div key={index} className="card-hover bg-white p-6 rounded-xl shadow-sm border">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes que se adaptan a tu conjunto
            </h2>
            <p className="text-xl text-gray-600">Escala según tus necesidades</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Básico",
                price: "Gratis",
                period: "siempre",
                description: "Perfect para conjuntos pequeños",
                features: [
                  "Hasta 25 unidades",
                  "Gestión de propiedades",
                  "Portal de comunicaciones",
                  "1 año de históricos",
                  "Soporte por email"
                ],
                popular: false
              },
              {
                name: "Estándar", 
                price: "$25",
                period: "por mes",
                description: "Ideal para conjuntos medianos",
                features: [
                  "Hasta 40 unidades",
                  "Todas las funciones básicas",
                  "Asambleas y votaciones",
                  "Sistema PQR avanzado",
                  "3 años de históricos",
                  "Soporte prioritario"
                ],
                popular: true
              },
              {
                name: "Premium",
                price: "$50", 
                period: "por mes",
                description: "Para conjuntos grandes y exigentes",
                features: [
                  "Hasta 90 unidades",
                  "Módulo financiero completo",
                  "Personalización de marca",
                  "5 años de históricos",
                  "API para integraciones",
                  "Soporte 24/7"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-xl shadow-sm border p-8 ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.price === "Gratis" ? "Empezar Gratis" : "Elegir Plan"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                role: "Administradora - Conjunto Villa Verde",
                content: "Armonía transformó completamente nuestra gestión. Los residentes están más informados y las asambleas son mucho más eficientes.",
                rating: 5
              },
              {
                name: "Carlos Rodríguez", 
                role: "Propietario - Torres del Norte",
                content: "Excelente plataforma. Ahora puedo consultar mi estado de cuenta, reservar áreas comunes y participar en votaciones desde mi celular.",
                rating: 5
              },
              {
                name: "Ana Martínez",
                role: "Contadora - Residencial El Bosque", 
                content: "La gestión financiera es impresionante. Los reportes son claros y el seguimiento de pagos se automatizó completamente.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section id="blog" className="section-padding bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recursos y Consejos
            </h2>
            <p className="text-xl text-gray-600">Aprende a optimizar la gestión de tu conjunto</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Cómo organizar una asamblea virtual exitosa",
                excerpt: "Guía completa para implementar asambleas digitales en tu conjunto residencial.",
                date: "15 Jun 2024",
                category: "Asambleas"
              },
              {
                title: "Automatización de cuotas: Beneficios y mejores prácticas",
                excerpt: "Descubre cómo automatizar el cobro de cuotas puede mejorar tu flujo de caja.",
                date: "10 Jun 2024", 
                category: "Finanzas"
              },
              {
                title: "Comunicación efectiva con residentes: 5 estrategias clave",
                excerpt: "Técnicas probadas para mantener informados y satisfechos a los propietarios.",
                date: "5 Jun 2024",
                category: "Comunicación"
              }
            ].map((post, index) => (
              <article key={index} className="bg-white rounded-xl shadow-sm border overflow-hidden hover-lift">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-purple-100"></div>
                <div className="p-6">
                  <div className="text-sm text-primary font-medium mb-2">{post.category}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="text-sm text-gray-500">{post.date}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para transformar tu conjunto?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Únete a cientos de conjuntos que ya confían en Armonía para su gestión diaria
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Comenzar Ahora - Gratis
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-primary">
              Solicitar Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Building2 className="h-8 w-8 text-primary mr-3" />
                <span className="text-xl font-bold">Armonía</span>
              </div>
              <p className="text-gray-400">
                Transformando la gestión residencial con tecnología avanzada.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white">Precios</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Guías</a></li>
                <li><a href="#" className="hover:text-white">Soporte</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Nosotros</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Armonía. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
