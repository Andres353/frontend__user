import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { WhatsAppVerification } from './pages/auth/WhatsAppVerification'
import { Addresses } from './pages/profile/Addresses'
import { Billing } from './pages/profile/Billing'
import { Pedidos } from './pages/Pedidos'
import { EmpresaProductos } from './pages/EmpresaProductos'
import { Carrito } from './pages/Carrito'
import { Dashboard } from './pages/admin/Dashboard'
import { Users } from './pages/admin/Users'
import { WhatsAppStatus } from './pages/admin/WhatsAppStatus'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { TestConnection } from './pages/TestConnection'
import { TestMap } from './components/TestMap'

function App() {
  return (
    <Routes>
      {/* Routes with sidebar and orange top bar */}
      <Route element={<MainLayout />}>
        <Route path="/empresa-productos" element={
          <ProtectedRoute>
            <EmpresaProductos />
          </ProtectedRoute>
        } />
        <Route path="/carrito" element={
          <ProtectedRoute>
            <Carrito />
          </ProtectedRoute>
        } />
        <Route path="/pedidos" element={
          <ProtectedRoute>
            <Pedidos />
          </ProtectedRoute>
        } />
      </Route>

      {/* Public Routes with Layout (including Navigation bar) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-whatsapp" element={<WhatsAppVerification />} />
        <Route path="/test" element={<TestConnection />} />
        <Route path="/test-map" element={<TestMap />} />
        
        {/* Protected Routes */}
        <Route path="/addresses" element={
          <ProtectedRoute>
            <Addresses />
          </ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <Dashboard />
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <Users />
        </AdminRoute>
      } />
      <Route path="/admin/whatsapp" element={
        <AdminRoute>
          <WhatsAppStatus />
        </AdminRoute>
      } />
      </Route>
    </Routes>
  )
}

export default App
