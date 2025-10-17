import { useQuery } from '@tanstack/react-query'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { apiService } from '@/services/api'

export const WhatsAppStatus = () => {
  const { data: whatsappStatus, isLoading, refetch } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: apiService.getWhatsAppStatus,
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  const recentActivity = [
    {
      id: 1,
      type: 'verification',
      message: 'Código enviado a +59178984335',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success'
    },
    {
      id: 2,
      type: 'verification',
      message: 'Código verificado para +59178984336',
      timestamp: '2024-01-15T10:25:00Z',
      status: 'success'
    },
    {
      id: 3,
      type: 'error',
      message: 'Error al enviar código a +59178984337',
      timestamp: '2024-01-15T10:20:00Z',
      status: 'error'
    },
    {
      id: 4,
      type: 'verification',
      message: 'Código enviado a +59178984338',
      timestamp: '2024-01-15T10:15:00Z',
      status: 'success'
    },
  ]

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estado WhatsApp</h1>
            <p className="mt-2 text-gray-600">
              Monitoreo y configuración del servicio de WhatsApp
            </p>
          </div>
          <Button onClick={() => refetch()}>
            Actualizar Estado
          </Button>
        </div>
      </div>

      {/* Estado Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Estado del Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              {whatsappStatus?.whatsappConnected ? (
                <>
                  <CheckCircleIcon className="h-12 w-12 text-green-500" />
                  <div>
                    <h3 className="text-2xl font-bold text-green-600">
                      Servicio Activo
                    </h3>
                    <p className="text-gray-600">
                      WhatsApp está conectado y funcionando correctamente
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircleIcon className="h-12 w-12 text-red-500" />
                  <div>
                    <h3 className="text-2xl font-bold text-red-600">
                      Servicio Inactivo
                    </h3>
                    <p className="text-gray-600">
                      WhatsApp no está conectado. Revisar configuración.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <p className="text-lg font-semibold text-gray-900">
                  {whatsappStatus?.serviceStatus || 'Desconocido'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Última actualización</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Códigos enviados hoy</span>
                <span className="text-lg font-semibold text-gray-900">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Códigos verificados</span>
                <span className="text-lg font-semibold text-gray-900">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasa de éxito</span>
                <span className="text-lg font-semibold text-green-600">75%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tiempo promedio</span>
                <span className="text-lg font-semibold text-gray-900">2.3s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configuración del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">URL del Servicio</span>
                <span className="text-sm text-gray-500">http://localhost:3001</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Puerto</span>
                <span className="text-sm text-gray-500">3001</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Timeout</span>
                <span className="text-sm text-gray-500">10 segundos</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Reintentos</span>
                <span className="text-sm text-gray-500">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Intervalo de verificación</span>
                <span className="text-sm text-gray-500">30 segundos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Logs activos</span>
                <span className="text-sm text-green-600">Sí</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button variant="outline">
              Probar Conexión
            </Button>
            <Button variant="outline">
              Ver Logs
            </Button>
            <Button variant="outline">
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



