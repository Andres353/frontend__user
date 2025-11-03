import { Navigation } from './Navigation'
import { Footer } from './Footer'
import { useLocation, Outlet } from 'react-router-dom'

export const Layout = () => {
  const location = useLocation()
  
  // No mostrar Navigation en la página Home ya que tiene su propio diseño
  const showNavigation = location.pathname !== '/'
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showNavigation && <Navigation />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}


