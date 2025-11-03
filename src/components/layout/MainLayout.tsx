import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '../../stores/authStore'
import { Bars3Icon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export const MainLayout = () => {
  const { isAuthenticated, user } = useAuthStore()
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Orange Top Bar - Full width at the top */}
      <div className="bg-orange-600 text-white px-4 py-3 w-full">
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
      
      {/* Content Area with Sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - Always visible */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

