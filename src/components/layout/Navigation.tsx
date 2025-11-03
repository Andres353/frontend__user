import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { 
  Bars3Icon, 
  XMarkIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Santiago Delivery
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-orange bg-green-50' 
                  : 'text-gray-700 hover:text-primary-orange hover:bg-gray-50'
              }`}
            >
              Inicio
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/addresses"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/addresses') 
                      ? 'text-primary-orange bg-green-50' 
                      : 'text-gray-700 hover:text-primary-orange hover:bg-gray-50'
                  }`}
                >
                  Direcciones
                </Link>
                <Link
                  to="/pedidos"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/pedidos') 
                      ? 'text-primary-orange bg-green-50' 
                      : 'text-gray-700 hover:text-primary-orange hover:bg-gray-50'
                  }`}
                >
                  Pedidos
                </Link>
                
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-orange hover:bg-gray-50 transition-colors">
                    <UserIcon className="h-5 w-5" />
                    <span>{user?.name}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/empresas"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <BuildingStorefrontIcon className="h-4 w-4 mr-3" />
                      Empresas
                    </Link>
                    <Link
                      to="/pedidos"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-3" />
                      Pedidos
                    </Link>
                    <Link
                      to="/billing"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3" />
                      Facturación
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-orange hover:bg-gray-50 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-orange hover:bg-orange-600 transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-orange hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-blue"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') 
                  ? 'text-primary-orange bg-green-50' 
                  : 'text-gray-700 hover:text-primary-orange hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/addresses"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/addresses') 
                      ? 'text-primary-orange bg-green-50' 
                      : 'text-gray-700 hover:text-primary-orange hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Direcciones
                </Link>
                <Link
                  to="/pedidos"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/pedidos') 
                      ? 'text-primary-orange bg-green-50' 
                      : 'text-gray-700 hover:text-primary-orange hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pedidos
                </Link>
                <Link
                  to="/billing"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-orange hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Facturación
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-orange hover:bg-gray-50"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-orange hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-orange hover:bg-orange-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
