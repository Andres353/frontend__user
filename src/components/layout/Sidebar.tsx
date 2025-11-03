import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AddressesModal } from '@/components/modals/AddressesModal'
import { 
  DocumentTextIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

export const Sidebar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false)

  return (
    <>
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
              <Link to="/empresas" className="flex items-center space-x-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg px-3">
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
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">f</span>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">📷</span>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">♪</span>
            </div>
          </div>
        </div>

        {/* Soporte */}
        <div className="px-6 mt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-orange-600">Soporte:</span>
              <br />
              <a href="tel:078984335" className="text-orange-600 hover:underline">
                078984335
              </a>
            </p>
          </div>
        </div>

        {/* Cerrar Sesión */}
        {isAuthenticated && (
          <div className="px-6 mt-8 mb-6">
            <button
              onClick={() => {
                logout()
                navigate('/register')
              }}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-orange-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span className="text-sm font-medium">CERRAR SESIÓN</span>
            </button>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {isAddressesModalOpen && (
        <AddressesModal
          isOpen={isAddressesModalOpen}
          onClose={() => setIsAddressesModalOpen(false)}
        />
      )}
    </>
  )
}

