import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { WhatsAppVerification } from './pages/auth/WhatsAppVerification'
import { Profile } from './pages/profile/Profile'
import { Addresses } from './pages/profile/Addresses'
import { Billing } from './pages/profile/Billing'
import { Dashboard } from './pages/admin/Dashboard'
import { Users } from './pages/admin/Users'
import { WhatsAppStatus } from './pages/admin/WhatsAppStatus'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { TestConnection } from './pages/TestConnection'

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-whatsapp" element={<WhatsAppVerification />} />
        <Route path="/test" element={<TestConnection />} />
        
        {/* Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
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
      </Routes>
    </Layout>
  )
}

export default App
