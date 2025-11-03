import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
// import { LoadingPage } from '@/components/ui/Loading'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import type { CreatePedidoRequest } from '@/types'

interface Empresa {
  id: string
  name: string
  description: string
  image?: string
  category: string
  rating: number
  deliveryTime: string
  minOrder: number
  isOpen: boolean
  locations?: Array<{
    id: string
    name: string
    address: string
    lat: number
    lng: number
    phone: string
  }>
  branCode?: string
  branchId?: string
  branchData?: any
  sucursalData?: any
}

interface Producto {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  stock: number
  rating: number
  empresaId: string
}

interface CartItem {
  producto: Producto
  quantity: number
  selectedVariables?: Array<{
    variableName: string
    optionName: string
    price: number
  }>
}

interface OrderForm {
  clientCode: string
  locationId: string
  total: number
  nit: string
  phone: number
  entcode: string
  comments: string
  paymentMethod: string
  type: string
  inRestaurant: boolean
  initialLocation: string
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
}

export const Carrito = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const empresa = location.state?.empresa as Empresa
  const carrito = location.state?.carrito as CartItem[]
  // sucursalData no es necesario para determinar locationId (dirección del usuario)
  
  const [cartItems, setCartItems] = useState<CartItem[]>(carrito || [])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [userDirections, setUserDirections] = useState<any[]>([])
  const [sucursales, setSucursales] = useState<any[]>([])
  // locationId proviene exclusivamente de la dirección seleccionada del usuario

  const {
    register,
    handleSubmit,
    formState: { errors: _errors },
    setValue
  } = useForm<OrderForm>({
    defaultValues: {
      clientCode: user?.id || '',
      locationId: '',
      total: 0,
      nit: '',
      phone: parseInt(user?.phone?.replace(/\D/g, '') || '0'),
      entcode: empresa?.id || '',
      comments: '',
      paymentMethod: 'efectivo',
      type: 'delivery',
      inRestaurant: false,
      initialLocation: '',
      products: []
    }
  })

  // Eliminado: lastLocation ya no se usa para pedidos

  // Cargar direcciones del usuario
  useEffect(() => {
    const loadDirections = async () => {
      if (user?.id) {
        try {
          const response = await apiService().getUserDirections(user.id)
          if (response.locationData) {
            setUserDirections(response.locationData)
            // Autoseleccionar la única dirección o la primera disponible
            if (!selectedAddress && response.locationData.length > 0) {
              const first = response.locationData[0]
              setSelectedAddress(first.id)
              setValue('locationId', first.id)
            }
          }
        } catch (error) {
          console.error('Error loading user directions:', error)
        }
      }
    }

    loadDirections()
  }, [user])

  // Cargar sucursales después de obtener direcciones del usuario
  useEffect(() => {
    const loadSucursales = async () => {
      if (empresa?.id) {
        try {
          // Obtener coordenadas del usuario de su primera dirección
          const userCoords = userDirections.length > 0 ? {
            lat: userDirections[0].lat,
            lng: userDirections[0].lng
          } : undefined
          
          const sucursalesResponse = await apiService().getSucursalesByEmpresa(
            empresa.id,
            userCoords?.lat,
            userCoords?.lng
          )
          if (sucursalesResponse.codeError === 'COD200' && sucursalesResponse.sucursales) {
            setSucursales(sucursalesResponse.sucursales)
          }
        } catch (error) {
          console.error('Error loading sucursales:', error)
        }
      }
    }

    loadSucursales()
  }, [user, empresa, userDirections])

  // Actualizar carrito cuando cambie
  useEffect(() => {
    if (carrito) {
      setCartItems(carrito)
    }
  }, [carrito])

  // Calcular total
  const total = cartItems.reduce((sum, item) => {
    const basePrice = item.producto.price
    const variablePrice = item.selectedVariables?.reduce((sum, variable) => sum + variable.price, 0) || 0
    const itemTotal = (basePrice + variablePrice) * item.quantity
    return sum + itemTotal
  }, 0)

  // Nota: la gestión del carrito ocurre en otras vistas; aquí no se agrega al carrito

  const removeFromCart = (productoId: string) => {
    setCartItems(cartItems.filter(item => item.producto.id !== productoId))
  }

  const updateQuantity = (productoId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productoId)
      return
    }

    setCartItems(cartItems.map(item =>
      item.producto.id === productoId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const onSubmit = async (data: OrderForm) => {
    if (cartItems.length === 0) {
      toast.error('Agrega al menos un producto al carrito')
      return
    }

    if (!selectedAddress) {
      toast.error('Selecciona una dirección de entrega')
      return
    }

    try {
      setLoading(true)
      
      // Obtener dirección seleccionada
      const selectedDirection = userDirections.find((dir: any) => dir.id === selectedAddress)
      
      // Preparar datos del pedido
      const phoneStr = user?.phone?.replace(/\D/g, '') || '78984335'
      // Tomar los últimos 9 dígitos para evitar overflow de int en Java (-2147483648 a 2147483647)
      const phoneNumber = parseInt(phoneStr.slice(-9)) || 78984335
      
      // locationId ES el id de la ubicación seleccionada por el cliente (dirección de entrega)
      const locationIdFinal = selectedDirection?.id || ''
      
      // Obtener el ID de la sucursal (usar la primera disponible o el ID desde el formulario)
      const sucursalId = sucursales.length > 0 ? sucursales[0]?.id : data.entcode || ''
      
      const orderData: CreatePedidoRequest = {
        clientCode: user?.id || '',
        locationId: locationIdFinal, // ID de la dirección o de la sucursal
        total: total,
        nit: data.nit || '',
        phone: phoneNumber,
        entcode: sucursalId,
        comments: data.comments || `Pedido de ${empresa?.name}`,
        paymentMethod: data.paymentMethod || 'efectivo',
        type: 'delivery',
        inRestaurant: false,
        initialLocation: selectedDirection?.direction || selectedDirection?.alias || '',
        products: cartItems.map(item => {
          const basePrice = item.producto.price
          const variablePrice = item.selectedVariables?.reduce((sum, variable) => sum + variable.price, 0) || 0
          const itemTotal = (basePrice + variablePrice) * item.quantity
          
          // Convertir selectedVariables al formato pvs esperado
          const pvs = item.selectedVariables ? item.selectedVariables.map(variable => ({
            name: variable.variableName,
            pricing: [{
              name: variable.optionName,
              price: variable.price
            }]
          })) : []
          
          return {
            itemCode: item.producto.id,
            quantity: item.quantity,
            nombre: item.producto.name,
            price: basePrice + variablePrice,
            total: itemTotal,
            pvs: pvs
          }
        })
      }

      console.log('Creating order with locationId (direccion.id):', orderData.locationId)
      const response = await apiService().createPedido(orderData)
      
      if (response.codeError === 'COD200') {
        // Guardar la última ubicación seleccionada por el usuario
        if (user?.id && locationIdFinal) {
          try {
            await apiService().updateUserLastLocation(user.id, locationIdFinal)
          } catch (e) {
            console.error('No se pudo actualizar lastLocation del usuario:', e)
          }
        }
        toast.success(
          `¡Pedido creado exitosamente!`,
          { duration: 5000 }
        )
        navigate('/pedidos')
      } else {
        toast.error(
          `${response.msgError || 'Error al crear el pedido'}. Se usó el ID de la dirección seleccionada como locationId: ${locationIdFinal}.`,
          { duration: 10000 }
        )
      }
    } catch (error: any) {
      console.error('Error creating order:', error)
      
      // Mensaje más específico
      let errorMessage = 'Error al crear el pedido'
      if (error.status === 400) {
        errorMessage = 'Los datos enviados no son válidos. Por favor, verifica la información ingresada.'
      } else if (error.status === 401) {
        errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.'
      } else if (error.status === 500) {
        errorMessage = 'Error del servidor. Por favor, intenta de nuevo más tarde.'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!empresa) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay empresa seleccionada
          </h3>
          <p className="text-gray-600 mb-4">
            Debes seleccionar una empresa primero
          </p>
          <Button onClick={() => navigate('/empresas')}>
            Seleccionar Empresa
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/empresa-productos', { state: { empresa } })}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver a Productos
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
              <p className="mt-2 text-gray-600">
                {empresa.name} - {empresa?.locations?.[0]?.name || 'Ubicación no especificada'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Carrito */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCartIcon className="h-5 w-5" />
                Carrito ({cartItems.length} productos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tu carrito está vacío</p>
                  <Button 
                    onClick={() => navigate('/empresa-productos', { state: { empresa } })}
                    className="mt-4"
                  >
                    Agregar Productos
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.producto.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center space-x-4">
                        {item.producto.image ? (
                          <img
                            src={item.producto.image}
                            alt={item.producto.name}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 font-bold text-lg">
                              {item.producto.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      <div className="flex-1">
                          <h4 className="font-medium text-lg">{item.producto.name}</h4>
                          <p className="text-sm text-gray-600">{item.producto.description}</p>
                          <p className="text-sm text-gray-500">Bs. {item.producto.price.toFixed(2)} c/u</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => updateQuantity(item.producto.id, item.quantity - 1)}
                          variant="outline"
                          size="sm"
                            className="w-8 h-8 rounded-full"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                            onClick={() => updateQuantity(item.producto.id, item.quantity + 1)}
                          variant="outline"
                          size="sm"
                            className="w-8 h-8 rounded-full"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                        </div>
                        <Button
                          onClick={() => removeFromCart(item.producto.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                        <div className="text-right min-w-[80px]">
                          <p className="font-bold text-lg">
                            Bs. {(item.producto.price * item.quantity).toFixed(2)}
                          </p>
                      </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-orange-600">Bs. {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full mt-6"
                    disabled={cartItems.length === 0}
                    size="lg"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Proceder al Pago
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumen del pedido */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {empresa.image ? (
                    <img
                      src={empresa.image}
                      alt={empresa.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZmY2YjM1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UmVzdGF1cmFudGU8L3RleHQ+Cjwvc3ZnPg=='
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 font-bold">{empresa.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{empresa.name}</h3>
                    <p className="text-sm text-gray-600">{empresa.category}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Productos:</span>
                    <span>{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items totales:</span>
                    <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pedido mínimo:</span>
                    <span>Bs. {empresa.minOrder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo estimado:</span>
                    <span>{empresa.deliveryTime}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">Bs. {total.toFixed(2)}</span>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de pago */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Finalizar Pedido"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Layout de dos columnas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              {/* Información del cliente - Compacta */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-1 text-sm flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  Cliente
                </h4>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p className="truncate"><strong>{user?.name || 'Usuario'}</strong></p>
                  <p className="truncate">{user?.phone || 'No especificado'}</p>
                </div>
              </div>

              {/* Dirección de entrega */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Dirección de Entrega
                </label>
                <Select
                  value={selectedAddress}
                  onChange={(e) => {
                    setSelectedAddress(e.target.value)
                    setValue('locationId', e.target.value)
                  }}
                  className="text-sm"
                >
                  <option value="">Selecciona una dirección</option>
                  {userDirections.map((direction) => (
                    <option key={direction.id} value={direction.id}>
                      {direction.alias} - {direction.direction}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <Select
                  {...register('paymentMethod', { required: 'Selecciona un método de pago' })}
                  className="text-sm"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="qr">Pago QR</option>
                </Select>
              </div>

              {/* NIT (opcional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  NIT (opcional)
                </label>
                <Input
                  {...register('nit')}
                  placeholder="123456789"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              {/* Sucursal de entrega */}
              {sucursales.length > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <h4 className="font-medium mb-1 text-sm text-orange-800">📍 Sucursal</h4>
                  <div className="text-xs text-orange-700">
                    <p className="font-semibold">{sucursales[0].name || 'Sucursal seleccionada'}</p>
                    <p className="text-xs text-orange-600 mt-0.5 line-clamp-1">{sucursales[0].address || ''}</p>
                  </div>
                </div>
              )}

              {/* Resumen del pedido - Compacto */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">Resumen</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Empresa:</span>
                    <span className="font-medium">{empresa.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Productos:</span>
                    <span className="font-medium">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-300">
                    <span>Total:</span>
                    <span className="text-orange-600">Bs. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Comentarios - Compacto */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Comentarios
                </label>
                <Textarea
                  {...register('comments')}
                  placeholder="Instrucciones..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="flex items-center gap-2"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Confirmar Pedido
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}