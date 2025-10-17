import { useQuery } from '@tanstack/react-query'
import { 
  UsersIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { apiService } from '@/services/api'

export const Dashboard = () => {
  const { data: whatsappStatus, isLoading } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: apiService.getWhatsAppStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const stats = [
    {
      name: 'Usuarios Totales',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
    },
    {
      name: 'Usuarios Activos Hoy',
      value: '456',
      change: '+8%',
      changeType: 'positive',
      icon: ClockIcon,
    },
    {
      name: 'Verificaciones WhatsApp',
      value: '89%',
      change: '+2%',
      changeType: 'positive',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Satisfacción',
      value: '4.8/5',
      change: '+0.1',
      changeType: 'positive',
      icon: CheckCircleIcon,
    },
  ]

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Resumen general del sistema Santiago Delivery
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary-green rounded-lg flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} desde el mes pasado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* WhatsApp Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Estado del Servicio WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              {whatsappStatus?.whatsappConnected ? (
                <>
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-lg font-semibold text-green-600">
                      Servicio Activo
                    </p>
                    <p className="text-sm text-gray-600">
                      WhatsApp está conectado y funcionando correctamente
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-lg font-semibold text-red-600">
                      Servicio Inactivo
                    </p>
                    <p className="text-sm text-gray-600">
                      WhatsApp no está conectado. Revisar configuración.
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Estado:</strong> {whatsappStatus?.serviceStatus || 'Desconocido'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Última actualización:</strong> {new Date().toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Nuevo usuario registrado
                  </p>
                  <p className="text-xs text-gray-500">Hace 2 minutos</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Verificación WhatsApp completada
                  </p>
                  <p className="text-xs text-gray-500">Hace 5 minutos</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Nueva dirección agregada
                  </p>
                  <p className="text-xs text-gray-500">Hace 10 minutos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">Ver Usuarios</h3>
              <p className="text-sm text-gray-600">Gestionar usuarios del sistema</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">Configurar WhatsApp</h3>
              <p className="text-sm text-gray-600">Revisar configuración del servicio</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">Generar Reporte</h3>
              <p className="text-sm text-gray-600">Exportar estadísticas del sistema</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



