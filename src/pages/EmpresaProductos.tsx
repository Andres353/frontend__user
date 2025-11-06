import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { 
  ArrowLeftIcon, 
  ShoppingCartIcon, 
  ClockIcon,
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingPage } from '@/components/ui/Loading'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { ProductVariablesModal } from '@/components/modals/ProductVariablesModal'

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
  branCode?: string  // Código de la sucursal desde get-companies-category
  branchId?: string  // ID de la sucursal
  branchData?: any   // Datos completos de la sucursal
}

interface Producto {
  id: string
  name: string
  description: string
  price: number
  image?: string | null
  category: string
  stock: number
  rating: number
  empresaId: string
  pv?: Array<{
    id: string
    name: string
    canMany: boolean
    required: boolean
    instructions?: string
    quantity?: number
    pricingBean: Array<{
      id: string
      name: string
      price: number
      pv: string
    }>
  }>
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

export const EmpresaProductos = () => {
  const { empresaId } = useParams<{ empresaId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<any>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [categories, setCategories] = useState<string[]>(['all'])
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingSucursales, setLoadingSucursales] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [carrito, setCarrito] = useState<CartItem[]>([])
  const [showVariablesModal, setShowVariablesModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)

  // Obtener empresa desde el estado de navegación o por ID
  useEffect(() => {
    if (location.state?.empresa) {
      setEmpresa(location.state.empresa)
    } else if (empresaId) {
      // Si no hay empresa en el estado, intentar obtenerla por ID
      console.log('Empresa ID:', empresaId)
      // Aquí podrías hacer una llamada a la API para obtener la empresa por ID
    }
    setLoading(false)
  }, [location.state, empresaId])

  // Cargar sucursales de la empresa
  useEffect(() => {
    const loadSucursales = async () => {
      if (empresa?.id) {
        try {
          setLoadingSucursales(true)
          console.log('🔍 Obteniendo sucursales para empresa:', empresa.id)
          
          // Primero obtener las sucursales de la empresa
          const sucursalesResponse = await apiService().getSucursalesByEmpresa(empresa.id)
          
          if (sucursalesResponse.codeError === 'COD200' && sucursalesResponse.sucursales.length > 0) {
            // Por ahora, usar la primera sucursal disponible
            // TODO: Implementar selección de sucursal más cercana o selección manual del usuario
            const primeraSucursal = sucursalesResponse.sucursales[0]
            setSucursalSeleccionada(primeraSucursal)
            console.log('✅ Sucursal seleccionada:', primeraSucursal)
          } else {
            console.warn('⚠️ Esta empresa no tiene sucursales configuradas, usando empresa ID directamente')
            // Si no hay sucursales, usar el ID de la empresa directamente
            // Esto permite que las categorías/productos se carguen igual
            setSucursalSeleccionada({ 
              id: empresa.id,
              name: empresa.name || 'Sucursal Principal',
              address: 'Dirección no especificada',
              lat: 0,
              lng: 0,
              phone: '',
              isOpen: empresa.isOpen,
              deliveryTime: empresa.deliveryTime,
              precio: '0',
              horario: ''
            })
            console.log('✅ Usando empresa ID como sucursal:', empresa.id)
          }
        } catch (error) {
          console.error('❌ Error loading sucursales, usando empresa ID:', error)
          // En caso de error, usar el ID de la empresa directamente
          setSucursalSeleccionada({ 
            id: empresa.id,
            name: empresa.name || 'Sucursal Principal',
            address: 'Dirección no especificada',
            lat: 0,
            lng: 0,
            phone: '',
            isOpen: empresa.isOpen,
            deliveryTime: empresa.deliveryTime,
            precio: '0',
            horario: ''
          })
        } finally {
          setLoadingSucursales(false)
        }
      }
    }
    
    loadSucursales()
  }, [empresa?.id])

  // Cargar categorías de la sucursal desde el endpoint específico
  useEffect(() => {
    const loadCategories = async () => {
      if (sucursalSeleccionada?.id) {
        try {
          setLoadingCategories(true)
          console.log('🔍 Cargando categorías para sucursal:', sucursalSeleccionada.id)
          console.log('🏪 Sucursal completa:', sucursalSeleccionada)
          
          // Llamar al endpoint de categorías de productos de la sucursal
          const { user } = useAuthStore.getState()
          const idUser = user?.id || ''
          console.log('👤 User ID:', idUser || 'No autenticado')
          
          console.log('📤 URL del endpoint:', `/santiago-catprod/get-category-products-data?id=${sucursalSeleccionada.id}&idUser=${idUser}`)
          
          const response = await axios.get('/santiago-catprod/get-category-products-data', {
            params: {
              id: sucursalSeleccionada.id,
              idUser: idUser
            }
          })
          
          console.log('📋 Respuesta completa:', JSON.stringify(response.data, null, 2))
          console.log('📋 Número de categorías:', response.data?.categories?.length || response.data?.categoriesData?.length)
          
          // El endpoint retorna categoriesData (no categories) con products dentro de cada categoría
          const categoriesData = response.data?.categoriesData || response.data?.categories || []
          
          if (categoriesData.length > 0) {
            // Extraer nombres de categorías
            const categoryNames = categoriesData.map((cat: any) => cat.categoryName || cat.categoryCode)
            console.log('✅ Categorías extraídas:', categoryNames)
            setCategories(['all', ...categoryNames])
            console.log('🎯 Categories state actualizado:', ['all', ...categoryNames])
            
            // Extraer productos de todas las categorías incluyendo sus variables (pv)
            const allProducts: Producto[] = []
            categoriesData.forEach((category: any) => {
              if (category.products && category.products.length > 0) {
                category.products.forEach((product: any) => {
                  // Convertir las variables (pv) del formato del endpoint al formato esperado
                  const productVariables = product.pv && product.pv.length > 0 
                    ? product.pv.map((pv: any) => ({
                        id: pv.id || '',
                        name: pv.name || '',
                        canMany: pv.canMany || false,
                        required: pv.required || false,
                        instructions: pv.instructions || '',
                        quantity: pv.quantity || 0,
                        pricingBean: (pv.pricingBean || []).map((pricing: any) => ({
                          id: pricing.id || '',
                          name: pricing.name || '',
                          price: pricing.price || 0,
                          pv: pricing.pv || pv.id || ''
                        }))
                      }))
                    : undefined
                  
                  allProducts.push({
                    id: product.itemCode || product.id || '',
                    name: product.itemName || product.name || '',
                    description: product.description || '',
                    price: product.itemPrice || product.price || 0,
                    image: product.imgUrl || product.url || null,
                    category: category.categoryName || category.categoryCode || 'Otros',
                    stock: product.stock || 0,
                    rating: product.rating || 0,
                    empresaId: empresa?.id || '',
                    pv: productVariables
                  })
                })
              }
            })
            
            console.log('✅ Productos extraídos del endpoint:', allProducts.length)
            setProductos(allProducts)
          } else {
            console.log('⚠️ No se encontraron categorías en la respuesta')
            console.log('📋 Respuesta data:', response.data)
            setCategories(['all'])
          }
        } catch (catError) {
          console.error('❌ Error loading categories:', catError)
          // Fallback: categorías estáticas
          setCategories(['all'])
        } finally {
          setLoadingCategories(false)
        }
      }
    }
    
    loadCategories()
  }, [sucursalSeleccionada?.id])

  // Los productos ya se cargan junto con las categorías desde el mismo endpoint

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || producto.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (producto: Producto) => {
    // Usar las variables directamente del producto (ya vienen del endpoint)
    if (producto.pv && producto.pv.length > 0) {
      // Si tiene variables, mostrar modal
      setSelectedProduct(producto)
      setShowVariablesModal(true)
    } else {
      // Si no tiene variables, agregar directamente
      setCarrito(prev => {
        const existingItem = prev.find(item => item.producto.id === producto.id && !item.selectedVariables)
        if (existingItem) {
          return prev.map(item =>
            item.producto.id === producto.id && !item.selectedVariables
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        } else {
          return [...prev, { producto, quantity: 1 }]
        }
      })
    }
  }

  const handleVariablesConfirm = (selectedVariables: Array<{
    variableName: string
    optionName: string
    price: number
  }>) => {
    if (!selectedProduct) return

    setCarrito(prev => {
      const existingItem = prev.find(item => 
        item.producto.id === selectedProduct.id &&
        JSON.stringify(item.selectedVariables) === JSON.stringify(selectedVariables)
      )
      
      if (existingItem) {
        return prev.map(item =>
          item.producto.id === selectedProduct.id &&
          JSON.stringify(item.selectedVariables) === JSON.stringify(selectedVariables)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { 
          producto: selectedProduct, 
          quantity: 1,
          selectedVariables 
        }]
      }
    })

    setShowVariablesModal(false)
    setSelectedProduct(null)
  }

  const handleCloseVariablesModal = () => {
    setShowVariablesModal(false)
    setSelectedProduct(null)
  }

  const removeFromCart = (productoId: string) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== productoId))
  }

  const updateQuantity = (productoId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productoId)
      return
    }
    
    setCarrito(prev =>
      prev.map(item =>
        item.producto.id === productoId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const getCartTotal = () => {
    return carrito.reduce((total, item) => {
      const basePrice = item.producto.price
      const variablePrice = item.selectedVariables?.reduce((sum, variable) => sum + variable.price, 0) || 0
      const itemTotal = (basePrice + variablePrice) * item.quantity
      return total + itemTotal
    }, 0)
  }

  const getCartItemCount = () => {
    return carrito.reduce((total, item) => total + item.quantity, 0)
  }

  const handleGoToCart = () => {
    if (empresa && carrito.length > 0) {
      navigate('/carrito', { 
        state: { 
          empresa: {
            ...empresa,
            sucursalData: sucursalSeleccionada  // Pasar datos de la sucursal seleccionada
          },
          carrito: carrito,
          productos: productos
        } 
      })
    }
  }

  if (loading || loadingSucursales) {
    return <LoadingPage message="Cargando empresa y sucursales..." />
  }

  if (!empresa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Empresa no encontrada</h1>
          <Button onClick={() => navigate('/empresas')}>
            Volver a Empresas
          </Button>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Volver</span>
              </Button>
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
                    <span className="text-gray-400 font-bold text-lg">{empresa.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{empresa.name}</h1>
                  <p className="text-gray-600">{empresa.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-gray-600">
                <ClockIcon className="h-4 w-4" />
                <span>{empresa.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Barra de Categorías Horizontal */}
        {!loadingCategories && categories.length > 1 && (
          <div className="mb-6">
            <div className="bg-orange-600 rounded-lg overflow-x-auto">
              <div className="flex space-x-1 px-2 py-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 font-bold text-sm uppercase whitespace-nowrap rounded transition-all ${
                      selectedCategory === category
                        ? 'bg-white text-gray-900 border-b-4 border-black'
                        : 'text-white hover:bg-orange-700'
                    }`}
                  >
                    {category === 'all' ? 'Ver Todos' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Separador */}
        <div className="border-t border-gray-300 mb-6"></div>

        {/* Carrito - Arriba del todo */}
        {getCartItemCount() > 0 && (
          <div className="mb-6">
            <Card className="shadow-lg border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
                      <span className="font-semibold text-lg">Carrito</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {getCartItemCount()} items
                      </span>
                    </div>
                    <div className="text-xl font-bold text-orange-600">
                      ${getCartTotal()}
                    </div>
                  </div>
                  <Button
                    onClick={handleGoToCart}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
                  >
                    Ver Carrito
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Buscar productos, categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-200 rounded-xl 
                         bg-white shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                         hover:border-gray-300 transition-all duration-200
                         placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center 
                         text-gray-400 hover:text-gray-600 transition-colors
                         focus:outline-none focus:text-orange-500"
                aria-label="Limpiar búsqueda"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-500">
              Buscando: <span className="font-semibold text-orange-600">"{searchTerm}"</span>
            </p>
          )}
        </div>

        {/* Productos */}
        <div className="w-full">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedCategory === 'all' 
                ? `Todos los Productos (${filteredProductos.length})`
                : `${selectedCategory} (${filteredProductos.length})`}
            </h2>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'Explora todos los productos disponibles'
                : `Productos de la categoría ${selectedCategory}`}
            </p>
          </div>

          {loadingCategories ? (
            <Card>
              <CardContent className="text-center py-12">
                <LoadingPage message="Cargando productos..." />
              </CardContent>
            </Card>
          ) : filteredProductos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No se encontraron productos para esta empresa</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProductos.map((producto) => {
                const cartItem = carrito.find(item => item.producto.id === producto.id)
                const quantity = cartItem?.quantity || 0

                return (
                  <Card key={producto.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                    <CardContent className="p-4 flex flex-col h-full">
                      {/* Imagen - altura fija */}
                      <div className="aspect-square mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {producto.image ? (
                          <img
                            src={producto.image}
                            alt={producto.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Título - altura mínima */}
                      <h3 className="font-semibold text-lg mb-2 min-h-[3rem] line-clamp-2">{producto.name}</h3>
                      
                      {/* Descripción - altura limitada */}
                      <p className="text-gray-600 text-sm mb-3 min-h-[3rem] line-clamp-2">{producto.description}</p>
                      
                      {/* Precio - siempre visible */}
                      <div className="mb-4 mt-auto">
                        <span className="text-2xl font-bold text-orange-600">
                          Bs. {producto.price.toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Botones - siempre en la misma posición abajo */}
                      <div className="mt-auto">
                        {quantity > 0 ? (
                          <div className="flex items-center justify-center space-x-3 bg-green-50 rounded-lg p-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(producto.id, quantity - 1)}
                              className="w-8 h-8 rounded-full border-2 border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                            <span className="font-bold text-lg min-w-[2rem] text-center">{quantity}</span>
                            <Button
                              size="sm"
                              onClick={() => updateQuantity(producto.id, quantity + 1)}
                              className="w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => addToCart(producto)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <ShoppingCartIcon className="h-4 w-4 mr-2" />
                            Agregar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de variables de producto */}
      {selectedProduct && (
        <ProductVariablesModal
          isOpen={showVariablesModal}
          onClose={handleCloseVariablesModal}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          productVariables={selectedProduct.pv}
          onConfirm={handleVariablesConfirm}
        />
      )}
    </div>
  )
}