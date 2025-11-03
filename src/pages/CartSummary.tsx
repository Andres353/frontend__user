import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  ShoppingCartIcon, 
  PencilIcon, 
  XMarkIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { Producto, Empresa } from '@/types'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { useAuthStore } from '@/stores/authStore'
import { MapComponent } from '@/components/maps/MapComponent'
import { apiService } from '@/services/api'
import Swal from 'sweetalert2'

interface CartItem {
  producto: Producto
  quantity: number
}

export const CartSummary = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [discount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Estados para autenticación
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailData, setEmailData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  
  // Obtener datos del usuario del store de autenticación
  const { user, logout } = useAuthStore()

  // Estados para el modal de pedido
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Dirección, 2: Sucursal, 3: Facturación
  const [addressData, setAddressData] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    reference: '',
    phone: ''
  })
  const [billingData, setBillingData] = useState({
    name: '',
    email: '',
    phone: '',
    nit: '',
    paymentMethod: 'efectivo'
  })

  // Estados para el mapa
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [mapAddress, setMapAddress] = useState('')
  
  // Estados para sucursales
  const [sucursales, setSucursales] = useState<any[]>([])
  const [selectedSucursal, setSelectedSucursal] = useState<any>(null)
  const [loadingSucursales, setLoadingSucursales] = useState(false)

  useEffect(() => {
    if (location.state?.carrito && location.state?.empresa) {
      const carrito = location.state.carrito
      const empresa = location.state.empresa
      const productos = location.state.productos || []
      
      setEmpresa(empresa)
      
      // Convertir carrito a array de items
      const items: CartItem[] = Object.entries(carrito).map(([productoId, quantity]) => {
        const producto = productos.find((p: Producto) => p.id === productoId)
        return {
          producto: producto || { id: productoId, name: 'Producto no encontrado', price: 0 } as Producto,
          quantity: quantity as number
        }
      }).filter(item => item.producto.name !== 'Producto no encontrado')
      
      setCartItems(items)
    }
    setLoading(false)
  }, [location.state])

  const updateQuantity = (productoId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productoId)
      return
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.producto.id === productoId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeItem = (productoId: string) => {
    setCartItems(prev => prev.filter(item => item.producto.id !== productoId))
  }

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.producto.price * item.quantity), 0)
  }

  const getTotal = () => {
    return getSubtotal() - discount
  }

  const handleGoogleLogin = () => {
    // El login con Google se maneja automáticamente por el GoogleLoginButton
    // que actualiza el store de autenticación
    setShowEmailForm(false)
  }

  const handleEmailLogin = () => {
    if (emailData.name && emailData.email) {
      const mockUser = {
        id: 'email_user_' + Date.now(),
        name: emailData.name,
        email: emailData.email,
        phone: emailData.phone || '+59100000000'
      }
      
      // Actualizar el store de autenticación directamente
      const authStore = useAuthStore.getState()
      authStore.login(mockUser, 'email_token_' + Date.now())
      
      setShowEmailForm(false)
    }
  }

  const handleContinue = () => {
    if (!user) {
      Swal.fire({
        title: '¡Inicia sesión!',
        text: 'Debes iniciar sesión para continuar con tu pedido',
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f97316',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-lg',
          title: 'text-gray-900',
          htmlContainer: 'text-gray-600'
        }
      })
      return
    }
    
    // Abrir modal de pedido
    setShowOrderModal(true)
    setCurrentStep(1)
    loadSucursales()
  }

  const loadSucursales = async () => {
    if (!empresa?.id) return
    
    setLoadingSucursales(true)
    try {
      const response = await apiService().getSucursalesByEmpresa(empresa.id)
      if (response.codeError === 'COD200' && response.sucursales) {
        setSucursales(response.sucursales)
        console.log('Sucursales cargadas:', response.sucursales)
      } else {
        console.log('No se pudieron cargar las sucursales:', response.msgError)
        setSucursales([])
      }
    } catch (error) {
      console.error('Error cargando sucursales:', error)
      setSucursales([])
    } finally {
      setLoadingSucursales(false)
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validar datos de dirección
      if (!addressData.street || !addressData.number || !addressData.neighborhood || !addressData.city) {
        Swal.fire({
          title: 'Datos incompletos',
          text: 'Por favor completa todos los campos obligatorios de la dirección',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f97316'
        })
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Validar selección de sucursal
      if (!selectedSucursal) {
        Swal.fire({
          title: 'Sucursal requerida',
          text: 'Por favor selecciona una sucursal para continuar',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f97316'
        })
        return
      }
      setCurrentStep(3)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else if (currentStep === 3) {
      setCurrentStep(2)
    }
  }

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation([lat, lng])
    
    try {
      // Usar Nominatim (OpenStreetMap) - API gratuita
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.address) {
          const address = data.address
          
          // Extraer información específica de la dirección
          const street = address.road || address.pedestrian || address.footway || ''
          const houseNumber = address.house_number || ''
          const neighborhood = address.suburb || address.neighbourhood || address.quarter || address.district || ''
          const city = address.city || address.town || address.village || address.municipality || address.county || ''
          const state = address.state || ''
          const country = address.country || ''
          
          // Construir dirección completa
          const addressParts = [street, houseNumber, neighborhood, city, state, country]
            .filter(part => part && part.trim() !== '')
          
          const fullAddress = addressParts.join(', ')
          setMapAddress(fullAddress)
          
          // Auto-completar campos de dirección
          setAddressData(prev => ({
            ...prev,
            street: street,
            number: houseNumber,
            neighborhood: neighborhood,
            city: city || 'Santa Cruz de la Sierra' // Fallback a ciudad por defecto
          }))
        } else {
          throw new Error('No se encontraron datos de dirección')
        }
      } else {
        throw new Error('Error en la API de geocoding')
      }
    } catch (error) {
      console.error('Error en geocoding:', error)
      
      // Fallback inteligente basado en coordenadas aproximadas
      let city = 'Santa Cruz de la Sierra' // Ciudad por defecto
      
      // Aproximación basada en coordenadas de Bolivia
      if (lat >= -17.5 && lat <= -15.5 && lng >= -68.5 && lng <= -62.5) {
        city = 'Santa Cruz de la Sierra'
      } else if (lat >= -16.8 && lat <= -16.3 && lng >= -68.3 && lng <= -67.8) {
        city = 'La Paz'
      } else if (lat >= -17.8 && lat <= -17.3 && lng >= -66.3 && lng <= -65.8) {
        city = 'Cochabamba'
      } else if (lat >= -19.1 && lat <= -18.8 && lng >= -68.1 && lng <= -67.8) {
        city = 'Oruro'
      } else if (lat >= -21.6 && lat <= -21.3 && lng >= -65.3 && lng <= -65.0) {
        city = 'Tarija'
      } else if (lat >= -19.6 && lat <= -19.3 && lng >= -65.8 && lng <= -65.5) {
        city = 'Potosí'
      } else if (lat >= -14.8 && lat <= -14.6 && lng >= -66.8 && lng <= -66.6) {
        city = 'Trinidad'
      } else if (lat >= -11.0 && lat <= -10.8 && lng >= -68.8 && lng <= -68.6) {
        city = 'Riberalta'
      }
      
      const fallbackAddress = `Ubicación seleccionada: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setMapAddress(fallbackAddress)
      
      setAddressData(prev => ({
        ...prev,
        city: city
      }))
    }
  }

  const handleFinishOrder = async () => {
    // Validar datos de facturación
    if (!billingData.name || !billingData.email) {
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor completa todos los campos obligatorios de facturación',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981'
      })
      return
    }

    // Validar datos de dirección
    if (!addressData.street || !addressData.number || !addressData.neighborhood || !addressData.city) {
      Swal.fire({
        title: 'Dirección incompleta',
        text: 'Por favor completa todos los campos obligatorios de la dirección',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981'
      })
      return
    }

    try {
      // Mostrar loading
      Swal.fire({
        title: 'Procesando pedido...',
        text: 'Por favor espera mientras procesamos tu pedido',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      // 1. Guardar dirección del usuario
      if (user?.id && selectedLocation) {
        try {
          const directionData = {
            location: `${addressData.street} ${addressData.number}, ${addressData.neighborhood}, ${addressData.city}`,
            lat: selectedLocation[0],
            lng: selectedLocation[1],
            alias: `${addressData.neighborhood} - ${addressData.street}`,
            url: mapAddress || '',
            userId: user.id
          }
          
          console.log('Guardando dirección:', directionData)
          await apiService().createDirection(directionData)
          console.log('Dirección guardada exitosamente')
        } catch (directionError) {
          console.error('Error al guardar dirección:', directionError)
          // Continuar con el pedido aunque falle guardar la dirección
        }
      }

      // 2. Guardar datos de facturación del usuario
      if (user?.id && billingData.name && billingData.email) {
        try {
          const facturaData = {
            userID: user.id,
            razonSocial: billingData.name,
            nit: billingData.nit || '123456789' // NIT por defecto si no se proporciona
          }
          
          console.log('Guardando facturación:', facturaData)
          await apiService().addFactura(facturaData)
          console.log('Facturación guardada exitosamente')
        } catch (facturaError) {
          console.error('Error al guardar facturación:', facturaError)
          // Continuar con el pedido aunque falle guardar la facturación
        }
      }

      // 3. Preparar datos del pedido
      const phoneStr = (billingData.phone || addressData.phone || '78984335').replace(/\D/g, '')
      // Tomar los últimos 9 dígitos para evitar overflow de int en Java (-2147483648 a 2147483647)
      const phoneNumber = parseInt(phoneStr.slice(-9)) || 78984335
      
      // Validar que tengamos una sucursal válida
      if (!selectedSucursal?.id) {
        Swal.fire({
          title: 'Error',
          text: 'No se encontró una sucursal válida. Por favor, intenta de nuevo.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        })
        return
      }
      
      const orderData = {
        clientCode: user?.id || 'guest',
        locationId: selectedSucursal.id, // Usar el ID real de la sucursal
        total: getTotal(),
        nit: billingData.nit || '123456789',
        phone: phoneNumber, // Solo últimos 9 dígitos para evitar overflow
        entcode: selectedSucursal?.id || '',
        comments: `${addressData.street} ${addressData.number}, ${addressData.neighborhood}, ${addressData.city}`,
        paymentMethod: billingData.paymentMethod,
        type: 'delivery',
        inRestaurant: false,
        initialLocation: selectedLocation ? `${selectedLocation[0]},${selectedLocation[1]}` : '0,0',
        products: cartItems.map(item => ({
          itemCode: item.producto.id,
          nombre: item.producto.name,
          quantity: item.quantity,
          price: item.producto.price,
          total: item.producto.price * item.quantity,
          pvs: [{
            name: 'default',
            pricing: [{
              name: 'precio',
              price: item.producto.price
            }]
          }]
        }))
      }

      console.log('Enviando pedido:', orderData)

      // 4. Crear el pedido
      const response = await apiService().createPedido(orderData)
      console.log('Respuesta del servidor:', response)

      // Mostrar éxito con información de la sucursal
      Swal.fire({
        title: '¡Pedido realizado!',
        html: `
          <p>Tu pedido ha sido enviado correctamente.</p>
          <p class="mt-2 font-semibold text-orange-600">
            📍 Sucursal de entrega: <strong>${selectedSucursal?.name || 'Sucursal seleccionada'}</strong>
          </p>
        `,
        icon: 'success',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981'
      }).then(() => {
        setShowOrderModal(false)
        // Limpiar carrito y redirigir
        navigate('/')
      })

    } catch (error) {
      console.error('Error al crear pedido:', error)

      Swal.fire({
        title: 'Error al procesar pedido',
        text: 'Hubo un problema al procesar tu pedido. Por favor intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!empresa || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carrito vacío</h2>
          <p className="text-gray-600 mb-4">No hay productos en tu carrito</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-orange-700 rounded">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <div className="text-center">
                <div className="text-sm font-medium">{empresa.name}</div>
                <div className="text-xs opacity-90">Santiago Delivery</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ShoppingCartIcon className="h-6 w-6" />
              <span className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Resumen de pedido */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de pedido</h2>
            
            {/* Tabla de productos */}
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                <div className="col-span-2">Cant.</div>
                <div className="col-span-6">Producto</div>
                <div className="col-span-4 text-right">Precio</div>
              </div>
              
              {cartItems.map((item) => (
                <div key={item.producto.id} className="grid grid-cols-12 gap-4 items-center py-2 border-b">
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.producto.id, item.quantity - 1)}
                        className="w-6 h-6 p-0"
                      >
                        -
                      </Button>
                      <span className="font-medium">{item.quantity}x</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.producto.id, item.quantity + 1)}
                        className="w-6 h-6 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-6">
                    <div className="font-medium text-gray-900">{item.producto.name}</div>
                    <div className="text-sm text-gray-500">{item.producto.description}</div>
                  </div>
                  <div className="col-span-4 text-right">
                    <div className="font-medium text-gray-900">
                      Bs. {(item.producto.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="flex items-center justify-end space-x-2 mt-1">
                      <button className="text-red-500 hover:text-red-700">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => removeItem(item.producto.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>Bs. {getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Descuento (Bs.):</span>
                <span>Bs. {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total (Bs.):</span>
                <span>Bs. {getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Botón continuar */}
            <Button 
              onClick={handleContinue}
              className="w-full mt-6 bg-black hover:bg-gray-800 text-white py-3 text-lg font-semibold"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>

        {/* Mis pedidos */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mis pedidos</h2>
            <p className="text-gray-500">No tienes pedidos guardados.</p>
          </CardContent>
        </Card>

        {/* Usuario - Obligatorio */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Usuario</h2>
            <p className="text-sm text-gray-600 mb-6">
              Inicia sesión para continuar con tu pedido.
            </p>
            
            {!user ? (
              <div className="space-y-3">
                <GoogleLoginButton 
                  onSuccess={handleGoogleLogin}
                  onError={(error) => {
                    console.error('Google Login Error:', error)
                    handleGoogleLogin()
                  }}
                />
                
                <Button 
                  onClick={() => setShowEmailForm(true)}
                  className="w-full justify-start bg-black hover:bg-gray-800 text-white"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-3" />
                  Continuar con correo electrónico
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user?.name}</div>
                    <div className="text-sm text-gray-600">{user?.email}</div>
                    {user?.phone && (
                      <div className="text-sm text-gray-600">{user.phone}</div>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-3"
                >
                  Continuar con el pedido
                </Button>
                
                         <Button
                           onClick={() => {
                             logout()
                             setShowEmailForm(false)
                           }}
                           variant="outline"
                           className="w-full"
                         >
                           Cambiar usuario
                         </Button>
              </div>
            )}

            {/* Formulario de email */}
            {showEmailForm && (
              <div className="mt-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-4">Ingresa tus datos</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Nombre completo"
                    value={emailData.name}
                    onChange={(e) => setEmailData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={emailData.email}
                    onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Teléfono (opcional)"
                    value={emailData.phone}
                    onChange={(e) => setEmailData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleEmailLogin}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      Continuar
                    </Button>
                    <Button 
                      onClick={() => setShowEmailForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Pedido */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header del Modal */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentStep === 1 ? 'Dirección de Entrega' : 
                   currentStep === 2 ? 'Seleccionar Sucursal' : 
                   'Datos de Facturación'}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Indicador de Pasos */}
              <div className="flex items-center mb-8">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Dirección</span>
                </div>
                <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Sucursal</span>
                </div>
                <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">Facturación</span>
                </div>
              </div>

              {/* Paso 1: Dirección */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Mapa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecciona tu ubicación en el mapa
                    </label>
                    <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                      <MapComponent
                        onLocationSelect={handleLocationSelect}
                        selectedLocation={selectedLocation}
                      />
                    </div>
                    {mapAddress && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Dirección seleccionada:</strong> {mapAddress}
                      </p>
                    )}
                  </div>


                  {/* Campos de dirección */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Detalles de la dirección</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Calle *
                        </label>
                        <Input
                          value={addressData.street}
                          onChange={(e) => setAddressData(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="Nombre de la calle"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número *
                        </label>
                        <Input
                          value={addressData.number}
                          onChange={(e) => setAddressData(prev => ({ ...prev, number: e.target.value }))}
                          placeholder="Número de casa"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Barrio *
                        </label>
                        <Input
                          value={addressData.neighborhood}
                          onChange={(e) => setAddressData(prev => ({ ...prev, neighborhood: e.target.value }))}
                          placeholder="Nombre del barrio"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ciudad *
                        </label>
                        <Input
                          value={addressData.city}
                          onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Ciudad"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referencia
                      </label>
                      <Input
                        value={addressData.reference}
                        onChange={(e) => setAddressData(prev => ({ ...prev, reference: e.target.value }))}
                        placeholder="Referencias adicionales (opcional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono de contacto
                      </label>
                      <Input
                        value={addressData.phone}
                        onChange={(e) => setAddressData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Teléfono para contacto"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Sucursal */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una sucursal</h3>
                    <p className="text-sm text-gray-600">Elige la sucursal de donde quieres que se prepare tu pedido</p>
                  </div>
                  
                  {loadingSucursales ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      <span className="ml-3 text-gray-600">Cargando sucursales...</span>
                    </div>
                  ) : sucursales.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {sucursales.map((sucursal) => (
                        <div
                          key={sucursal.id}
                          className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedSucursal?.id === sucursal.id
                              ? 'border-orange-600 bg-orange-50 shadow-md'
                              : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedSucursal(sucursal)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{sucursal.name}</h4>
                                {selectedSucursal?.id === sucursal.id && (
                                  <span className="ml-2 px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                                    Seleccionada
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{sucursal.address}</p>
                              <div className="flex items-center text-xs text-gray-500">
                                <span className="mr-4">📞 {sucursal.phone}</span>
                                <span>📍 {sucursal.lat?.toFixed(4)}, {sucursal.lng?.toFixed(4)}</span>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedSucursal?.id === sucursal.id
                                ? 'border-orange-600 bg-orange-600'
                                : 'border-gray-300'
                            }`}>
                              {selectedSucursal?.id === sucursal.id && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">🏪</div>
                      <p className="text-lg font-medium mb-2">No hay sucursales disponibles</p>
                      <p className="text-sm">Esta empresa no tiene sucursales registradas en el sistema</p>
                    </div>
                  )}
                </div>
              )}

              {/* Paso 3: Facturación */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo *
                      </label>
                      <Input
                        value={billingData.name}
                        onChange={(e) => setBillingData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={billingData.email}
                        onChange={(e) => setBillingData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">
                               Teléfono
                             </label>
                             <Input
                               value={billingData.phone}
                               onChange={(e) => setBillingData(prev => ({ ...prev, phone: e.target.value }))}
                               placeholder="Teléfono de contacto"
                             />
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">
                               NIT (opcional)
                             </label>
                             <Input
                               value={billingData.nit}
                               onChange={(e) => setBillingData(prev => ({ ...prev, nit: e.target.value }))}
                               placeholder="Número de identificación tributaria"
                             />
                           </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de pago
                    </label>
                    <select
                      value={billingData.paymentMethod}
                      onChange={(e) => setBillingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta de crédito/débito</option>
                      <option value="transferencia">Transferencia bancaria</option>
                    </select>
                  </div>

                  {/* Resumen del pedido */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Resumen del pedido</h3>
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.producto.id} className="flex justify-between text-sm">
                          <span>{item.producto.name} x {item.quantity}</span>
                          <span>${(item.producto.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${getTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones del Modal */}
              <div className="flex justify-between mt-8">
                <div>
                  {currentStep === 2 && (
                    <Button
                      onClick={handlePreviousStep}
                      variant="outline"
                    >
                      Anterior
                    </Button>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowOrderModal(false)}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNextStep}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinishOrder}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Finalizar Pedido
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
