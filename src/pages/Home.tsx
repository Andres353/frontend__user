import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  TruckIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export const Home = () => {
  const { isAuthenticated, user } = useAuthStore()

  const features = [
    {
      icon: TruckIcon,
      title: 'Delivery Rápido',
      description: 'Entregas en menos de 30 minutos en toda la ciudad'
    },
    {
      icon: ClockIcon,
      title: 'Disponible 24/7',
      description: 'Servicio disponible las 24 horas del día, todos los días'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Seguro y Confiable',
      description: 'Tus pedidos están protegidos con garantía de entrega'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Soporte WhatsApp',
      description: 'Atención al cliente por WhatsApp en tiempo real'
    }
  ]

  const quickActions = [
    {
      icon: MapPinIcon,
      title: 'Mis Direcciones',
      description: 'Gestiona tus direcciones de entrega',
      link: '/addresses',
      color: 'bg-blue-500'
    },
    {
      icon: CreditCardIcon,
      title: 'Facturación',
      description: 'Configura tus datos de facturación',
      link: '/billing',
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-green to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Santiago Delivery
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              La mejor plataforma de delivery de comida en Santiago. 
              Rápido, seguro y confiable.
            </p>
            
            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-lg text-green-100">
                  ¡Bienvenido de vuelta, {user?.name}!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/profile">
                    <Button size="lg" variant="outline" className="bg-white text-primary-green hover:bg-gray-50">
                      Ver Mi Perfil
                    </Button>
                  </Link>
                  <Link to="/addresses">
                    <Button size="lg" className="bg-green-700 hover:bg-green-800">
                      Gestionar Direcciones
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-primary-green hover:bg-gray-50">
                    Crear Cuenta
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-green">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir Santiago Delivery?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ofrecemos el mejor servicio de delivery con tecnología de punta 
            y atención personalizada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto h-12 w-12 bg-primary-green rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions for authenticated users */}
      {isAuthenticated && (
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Acciones Rápidas
              </h2>
              <p className="text-lg text-gray-600">
                Gestiona tu cuenta y configuración de manera fácil
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`h-12 w-12 ${action.color} rounded-lg flex items-center justify-center`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {action.title}
                          </h3>
                          <p className="text-gray-600">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-primary-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya disfrutan de nuestro servicio
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-primary-blue hover:bg-gray-50">
                    Registrarse Gratis
                  </Button>
                </Link>
                <Link to="/verify-whatsapp">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-blue">
                    Verificar WhatsApp
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
