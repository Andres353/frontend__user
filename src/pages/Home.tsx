import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { apiService } from '@/services/api'
import { AddressesModal } from '@/components/modals/AddressesModal'
import { 
  Bars3Icon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ClockIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export const Home = () => {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // Usar coordenadas por defecto (Cochabamba)
          setUserLocation({ lat: -17.3895, lng: -66.1568 })
        }
      )
    } else {
      // Usar coordenadas por defecto (Cochabamba)
      setUserLocation({ lat: -17.3895, lng: -66.1568 })
    }
  }, [])

  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        
        const response = await apiService().getCategories()
        
        if (response.generic.codeError === 'COD200' && response.categories) {
          setCategories(response.categories)
        } else {
          console.error('Error loading categories:', response.generic.msgError)
          setCategories([])
        }
      } catch (error: any) {
        console.error('Error loading categories:', error)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Cargar empresas desde la API
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        setLoadingEmpresas(true)
        
        const response = await apiService().getEmpresas()
        
        if (response.codeError === 'COD200' && response.data) {
          setEmpresas(response.data)
        } else {
          console.error('Error loading empresas:', response.msgError)
          setEmpresas([])
        }
      } catch (error: any) {
        console.error('Error loading empresas:', error)
        setEmpresas([])
      } finally {
        setLoadingEmpresas(false)
      }
    }

    loadEmpresas()
  }, [])


  // Función para manejar el clic en una empresa
  const handleEmpresaClick = (empresa: any) => {
    navigate('/empresa-productos', { 
      state: { 
        empresa: empresa
      } 
    })
  }

  // Función para manejar el clic en una categoría
  const handleCategoryClick = async (category: any) => {
    setSelectedCategory(category.name)
    
    // Si hay usuario autenticado y ubicación, cargar empresas por categoría
    if (isAuthenticated && user && userLocation) {
      try {
        setLoadingEmpresas(true)
        const response = await apiService().getEmpresasByCategory(
          category.categoryCode || category.name,
          user.id,
          userLocation.lat,
          userLocation.lng
        )
        
        if (response.codeError === 'COD200' && response.empresas) {
          setEmpresas(response.empresas)
        }
      } catch (error) {
        console.error('Error loading empresas by category:', error)
      } finally {
        setLoadingEmpresas(false)
      }
    } else {
      // Si no hay usuario autenticado, filtrar empresas locales
      setEmpresas(prevEmpresas => 
        prevEmpresas.filter(emp => emp.category === category.name)
      )
    }
  }

  // Función para mostrar todas las empresas
  const handleShowAll = async () => {
    setSelectedCategory(null)
    setLoadingEmpresas(true)
    
    try {
      const response = await apiService().getEmpresas()
      if (response.codeError === 'COD200' && response.data) {
        setEmpresas(response.data)
      }
    } catch (error) {
      console.error('Error loading all empresas:', error)
    } finally {
      setLoadingEmpresas(false)
    }
  }

  // Función para obtener emoji según el tipo de empresa
  const getEmpresaEmoji = (empresaName: string) => {
    const name = empresaName.toLowerCase()
    if (name.includes('pollo') || name.includes('chicken') || name.includes('broaster')) return '🍗'
    if (name.includes('pizza') || name.includes('pizzeria')) return '🍕'
    if (name.includes('hamburguesa') || name.includes('burger')) return '🍔'
    if (name.includes('sandwich') || name.includes('sanduche')) return '🥪'
    if (name.includes('comida') || name.includes('restaurant')) return '🍽️'
    if (name.includes('cafe') || name.includes('coffee')) return '☕'
    if (name.includes('helado') || name.includes('ice')) return '🍦'
    if (name.includes('postre') || name.includes('dessert')) return '🍰'
    if (name.includes('bebida') || name.includes('drink')) return '🥤'
    if (name.includes('salteña') || name.includes('empanada')) return '🥟'
    if (name.includes('milanesa')) return '🥩'
    if (name.includes('combo') || name.includes('promo')) return '🎯'
    return '🏪' // Emoji por defecto para empresas
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Naranja */}
      <div className="bg-orange-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bars3Icon className="h-6 w-6" />
            <span className="text-lg font-semibold">SANTIAGO DELIVERY</span>
            {isAuthenticated && user && (
              <span className="text-sm opacity-75">- Bienvenido {user.name}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2">
               <MapPinIcon className="h-5 w-5" />
               <span className="text-sm">Cochabamba</span>
             </div>
            
            <div className="flex items-center space-x-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="text-sm">Calificaciones &gt;</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Blanco */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          {/* Logo */}
          <div className="p-6">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">SD</span>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-orange-600">SANTIAGO</h2>
              <p className="text-sm text-gray-600">DELIVERY</p>
            </div>
          </div>

          {/* Selector de idioma */}
          <div className="px-6 mb-6">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm font-medium">Español</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Navegación */}
          <div className="px-6 space-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/carrito" className="flex items-center space-x-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg px-3">
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span className="text-sm">Repetir última compra</span>
                  </Link>
                
                <button 
                  onClick={() => setIsAddressesModalOpen(true)}
                  className="flex items-center space-x-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg px-3 w-full text-left"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                  <span className="text-sm">Mis direcciones</span>
                </button>
                
                <Link to="/pedidos" className="flex items-center space-x-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg px-3">
                  <ClockIcon className="h-5 w-5" />
                  <span className="text-sm">Mis pedidos</span>
                  </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">Inicia sesión para acceder a todas las funciones</p>
                <Link to="/login" className="text-orange-600 text-sm font-medium hover:underline">
                    Iniciar Sesión
                </Link>
              </div>
            )}
          </div>

          {/* Redes sociales */}
          <div className="px-6 mt-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Nuestras redes sociales</h3>
            <div className="flex space-x-3">
              <a 
                href="https://www.facebook.com/share/17ghaJQvVQ/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <span className="text-white text-xs font-bold">f</span>
              </a>
            </div>
          </div>

          {/* Soporte */}
          <div className="px-6 mt-8">
            <p className="text-sm text-gray-600 mb-2">
              ¿Necesitas ayuda?{' '}
              <a href="tel:63884670" className="text-orange-600 hover:underline font-medium">
                contáctate con soporte
              </a>
            </p>
            <a href="tel:63884670" className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="text-white text-xs">💬</span>
              </div>
              <span className="text-sm font-medium">63884670</span>
            </a>
          </div>

          {/* Botón cerrar sesión */}
          <div className="px-6 mt-8">
            <button 
              onClick={() => {
                // Cerrar sesión y navegar al registro
                const { logout } = useAuthStore.getState()
                logout()
                navigate('/register')
              }}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-orange-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span className="text-sm font-medium">CERRAR SESIÓN</span>
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 bg-white">
          {/* Información de entrega */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Entregas - Santiago Delivery</h3>
                <p className="text-sm text-gray-600">Costo el envío: N/A BOB</p>
              </div>
              <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                <ArrowPathIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Cambiar sucursal</span>
              </button>
            </div>
          </div>

          {/* Categorías */}
          <div className="mx-6 mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Explora por Categorías</h2>
                {selectedCategory && (
                  <button
                    onClick={handleShowAll}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Ver todas
                  </button>
                )}
              </div>
              
              {loadingCategories ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <span className="ml-3 text-gray-600">Cargando categorías...</span>
                </div>
              ) : categories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <div 
                      key={category.categoryCode}
                      onClick={() => handleCategoryClick(category)}
                      className={`rounded-lg p-4 text-white cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 ${
                        selectedCategory === category.name
                          ? 'bg-gradient-to-br from-orange-600 to-orange-700 ring-2 ring-orange-400'
                          : 'bg-gradient-to-br from-orange-500 to-orange-600'
                      }`}
                    >
                      <div className="text-3xl mb-2 text-center">
                        {getEmpresaEmoji(category.name)}
                      </div>
                      <h3 className="font-bold text-center text-sm">
                        {category.name.toUpperCase()}
                      </h3>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No hay categorías disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Empresas Disponibles */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedCategory ? `Empresas de ${selectedCategory}` : 'Empresas Disponibles'}
            </h2>
            
          {loadingEmpresas ? (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-3 text-gray-600">Cargando empresas...</span>
            </div>
          ) : empresas.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
              {empresas.map((empresa) => (
                <div 
                  key={empresa.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleEmpresaClick(empresa)}
                >
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      {empresa.image ? (
                        <img 
                          src={empresa.image} 
                          alt={empresa.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement
                            const fallback = target.nextElementSibling as HTMLElement
                            if (target) target.style.display = 'none'
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ display: empresa.image ? 'none' : 'flex' }}
                      >
                        <span className="text-4xl">{getEmpresaEmoji(empresa.name)}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 text-center">
                        {empresa.name.toUpperCase()}
                      </h3>
                      {empresa.description && (
                        <p className="text-xs text-gray-500 text-center mt-1">
                          {empresa.description}
                        </p>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏪</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay empresas disponibles
                </h3>
                <p className="text-gray-500 mb-4">
                  Aún no hay empresas registradas en el sistema.
                </p>
              </div>
            )}
            </div>

        </div>
      </div>

      {/* Modal de direcciones */}
      <AddressesModal 
        isOpen={isAddressesModalOpen}
        onClose={() => setIsAddressesModalOpen(false)}
      />
    </div>
  )
}