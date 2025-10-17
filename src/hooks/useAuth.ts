import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

export const useAuth = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    setLoading, 
    updateUser 
  } = useAuthStore()

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !isAuthenticated) {
      setLoading(true)
      // Aquí podrías validar el token con el backend
      // Por ahora, simplemente marcamos como no autenticado si no hay usuario
      if (!user) {
        logout()
      }
      setLoading(false)
    }
  }, [isAuthenticated, user, setLoading, logout])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  }
}

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth()
  
  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && !isAuthenticated,
  }
}
