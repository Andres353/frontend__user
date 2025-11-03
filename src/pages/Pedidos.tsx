import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingBagIcon,
  ClockIcon,
  EyeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingPage } from '@/components/ui/Loading'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface Pedido {
  id: string
  clientName: string
  clientCode: string
  deliveryCode?: string
  deliveryName?: string
  creationDate: string
  urlEmpresa?: string
  total: number
  status: number
  orderCode: string
  entName: string
  cel: string
  tel: string
  auxCel: string
  sizePaquete?: string
  nit: string
  razonSocial: string
  location: {
    locationEnt: string
    latEnt: number
    lngEnt: number
    locationUser: string
    latUser: number
    lngUser: number
    initialLocationLat: number
    initialLocationLng: number
    initialLocation: string
    alias: string
  }
  comments: string
  visibility: boolean
  products: Array<{
    itemCode: string
    quantity: number
    nombre: string
    price: number
    total: number
    pvs: Array<{
      name: string
      pricing: Array<{
        name: string
        price: number
      }>
    }>
  }>
  type: string
  entImg?: string
  imgPedido?: string
  chatData?: {
    udChat: string
    readDoChatData: boolean
    readUoChatData: boolean
    uochat: string
    dochat: string
  }
  lastUpdate: string
  waitingTime: string
  inRestaurant: boolean
  paymentMethod: string
  motivo?: string
  orderLit: string
  celular: string
  telefono: string
  comision: number
  fee: number
  by: string
  urlImg?: string
  dateIMG?: string
  urlPedido?: string[]
  sosData?: {
    deliveryCode: string
    orderid: string
    name: string
    msg: string
    lat: number
    lng: number
  }
  kilometersData?: {
    distance: number
    price: number
    tiempoLimite: number
    generic: {
      codeError: string
      msgError: string
    }
  }
}

const getStatusInfo = (status: number) => {
  const statusMap = {
    0: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    1: { text: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
    2: { text: 'En Preparación', color: 'bg-orange-100 text-orange-800', icon: ClockIcon },
    3: { text: 'Listo', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    4: { text: 'En Camino', color: 'bg-purple-100 text-purple-800', icon: TruckIcon },
    5: { text: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    6: { text: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircleIcon }
  }
  return statusMap[status as keyof typeof statusMap] || statusMap[0]
}

export const Pedidos = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)

  // Cargar pedidos del usuario con actualización automática cada 15 segundos
  const { data: pedidosResponse, isLoading: loading } = useQuery({
    queryKey: ['pedidos', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const response = await apiService().getPedidosByUser(user.id, 0, 50)
      return response
    },
    enabled: !!user?.id,
    refetchInterval: 15000, // Actualizar cada 15 segundos
    refetchOnWindowFocus: true, // Actualizar cuando el usuario vuelve a la pestaña
    retry: 2,
  })

  const pedidos = pedidosResponse?.ordersData || []

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const handleViewDetails = (pedido: Pedido) => {
    setSelectedPedido(pedido)
  }

  if (loading) {
    return <LoadingPage message="Cargando pedidos..." />
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver al Inicio
            </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
            <p className="mt-2 text-gray-600">
                Historial de todos tus pedidos
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      {pedidos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes pedidos aún
            </h3>
            <p className="text-gray-600 mb-4">
              Aún no has realizado ningún pedido
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pedidos.map((pedido) => {
            const statusInfo = getStatusInfo(pedido.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card key={pedido.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                <CardContent className="p-4">
                  {/* Header con título y estado */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 mb-1">
                        {pedido.entName}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.text}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">
                        Bs. {pedido.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(pedido.creationDate)}
                      </div>
                    </div>
                  </div>

                  {/* Productos */}
                      <div className="mb-3">
                        <div className="space-y-1.5">
                          {pedido.products?.slice(0, 2).map((producto, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 truncate flex-1">
                                <span className="font-medium text-gray-900">{producto.quantity}x</span> {producto.nombre}
                              </span>
                              <span className="text-gray-700 font-medium ml-2 flex-shrink-0">Bs. {producto.total.toFixed(2)}</span>
                            </div>
                          ))}
                          {pedido.products && pedido.products.length > 2 && (
                            <div className="text-xs text-gray-500 pt-1">
                              +{pedido.products.length - 2} producto{pedido.products.length - 2 > 1 ? 's' : ''} más
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer con método de pago y botón */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          <span className="capitalize">{pedido.paymentMethod}</span>
                        </div>
                        <Button
                          onClick={() => handleViewDetails(pedido)}
                          variant="outline"
                          size="sm"
                          className="text-xs px-3 py-1.5"
                        >
                          <EyeIcon className="h-3.5 w-3.5 mr-1.5" />
                          Detalles
                        </Button>
                      </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedPedido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPedido.entName}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedPedido.status).color}`}>
                      {getStatusInfo(selectedPedido.status).text}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(selectedPedido.creationDate)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedPedido(null)}
                  variant="outline"
                  className="rounded-lg"
                >
                  Cerrar
                </Button>
              </div>
            </div>

            <div className="p-6">
              {/* Resumen destacado */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-6 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total del pedido</p>
                    <p className="text-3xl font-bold text-orange-600">
                      Bs. {selectedPedido.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Método de pago</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {selectedPedido.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Información de ubicación */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPinIcon className="h-5 w-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Entrega</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPedido.location?.locationUser || 'No especificada'}
                        </p>
                      </div>
                      {selectedPedido.location?.locationEnt && (
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Empresa</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedPedido.location.locationEnt}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Información adicional */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tipo de pedido</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {selectedPedido.type || 'Delivery'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tiempo de espera</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedPedido.waitingTime || 'No especificado'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Productos */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
                  <div className="space-y-3">
                    {selectedPedido.products?.map((producto, index) => (
                      <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{producto.nombre}</h4>
                          <p className="text-sm text-gray-600">
                            Cantidad: <span className="font-medium">{producto.quantity}</span>
                          </p>
                          {producto.pvs && producto.pvs.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {producto.pvs.map((pv, pvIndex) => (
                                <p key={pvIndex} className="text-xs text-gray-500">
                                  • {pv.name}: {pv.pricing.map(p => p.name).join(', ')}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-600 mb-1">
                            Bs. {producto.price.toFixed(2)} c/u
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            Bs. {producto.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Comentarios */}
              {selectedPedido.comments && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentarios</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-gray-700 leading-relaxed">
                        {selectedPedido.comments}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
