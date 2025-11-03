import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { loadGoogleScript, initializeGoogle } from '../../config/google'

interface GoogleLoginButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export const GoogleLoginButton = ({ onSuccess, onError }: GoogleLoginButtonProps) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()

  // Cargar Google Script al montar el componente
  useEffect(() => {
    const loadGoogle = async () => {
      try {
        console.log('🔄 Cargando Google Identity Services...')
        await loadGoogleScript()
        console.log('✅ Google script cargado, inicializando...')
        
        // Configurar callback para manejar respuesta de Google
        const handleGoogleResponse = (response: any) => {
          console.log('Google response received:', response)
          setIsLoading(true)
          if (response.credential) {
            validateGoogleTokenMutation.mutate(response.credential)
          } else {
            onError?.('No se recibió token de Google')
            setIsLoading(false)
          }
        }
        
        initializeGoogle(handleGoogleResponse)
        
        // Renderizar el botón nativo de Google
        if (window.google?.accounts?.id) {
          const buttonDiv = document.getElementById('google-signin-button')
          if (buttonDiv) {
            console.log('🎨 Renderizando botón de Google...')
            try {
              // Calcular un ancho válido (GSI solo acepta valores numéricos entre 120 y 400)
              const containerWidth = buttonDiv.offsetWidth || 0
              const validWidth = Math.min(400, Math.max(120, containerWidth || 320))
              window.google.accounts.id.renderButton(buttonDiv, {
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                width: validWidth
              })
              console.log('✅ Botón de Google renderizado correctamente')
            } catch (renderError) {
              console.error('❌ Error al renderizar botón de Google:', renderError)
              // Mostrar mensaje de error específico
              buttonDiv.innerHTML = `
                <div class="p-4 border border-red-300 rounded-md bg-red-50">
                  <p class="text-red-800 text-sm">
                    <strong>Error de configuración de Google:</strong><br>
                    El origen actual (${window.location.origin}) no está autorizado.<br>
                    <span class="text-xs">Contacta al administrador para agregar esta URL a Google Cloud Console.</span>
                  </p>
                </div>
              `
              onError?.('Error de configuración de Google OAuth')
            }
          }
        }
        
        console.log('🚀 Google Login listo para usar')
        setIsGoogleLoaded(true)
      } catch (error) {
        console.error('❌ Error loading Google script:', error)
        onError?.('Error al cargar Google Login')
      }
    }

    loadGoogle()
  }, [onError])

  // Mutación para validar token de Google
  const validateGoogleTokenMutation = useMutation({
    mutationFn: (token: string) => apiService().googleLogin({ token_id: token }),
    onSuccess: async (response) => {
      console.log('Google token validation response:', response)
      
      if (response.codeError === 'COD200') {
        const email = response.msgError // El email viene en msgError
        console.log('Google login successful, email:', email)
        
        // Verificar si el usuario existe
        try {
          const userData = await apiService().getUserData(email)
          console.log('User data from Google login:', userData)
          
          if (userData.generic.codeError === 'COD200') {
            // Usuario existe, hacer login
            const user = {
              id: userData.id,
              name: userData.names + ' ' + userData.lastNames,
              email: userData.email,
              phone: userData.phoneNumber || '+59100000000'
            }
            
            login(user, 'google_token_' + Date.now())
            toast.success('¡Bienvenido con Google!')
            onSuccess?.()
          } else {
            // Usuario no existe, crear cuenta
            // Necesitamos pasar el token original, no el email
            const originalToken = validateGoogleTokenMutation.variables
            if (originalToken) {
              await createGoogleUserMutation.mutateAsync(originalToken)
            } else {
              onError?.('No se pudo obtener el token de Google')
            }
          }
        } catch (error) {
          console.error('Error getting user data:', error)
          onError?.('Error al obtener datos del usuario')
        }
      } else {
        onError?.(response.msgError || 'Error en la validación de Google')
      }
    },
    onError: (error) => {
      console.error('Google token validation error:', error)
      onError?.('Error al validar token de Google')
    },
  })

  // Mutación para crear usuario de Google
  const createGoogleUserMutation = useMutation({
    mutationFn: (token: string) => {
      // Usar el token real de Google
      return apiService().googleOperation({ token_id: token })
    },
    onSuccess: async (response) => {
      console.log('Google user creation response:', response)
      
      if (response.codeError === 'COD200' || response.codeError === 'COD353') {
        // Usuario creado o ya existe, obtener datos
        try {
          // Obtener el email del token de validación original
          const email = validateGoogleTokenMutation.data?.msgError
          if (email) {
            const userData = await apiService().getUserData(email)
            
            if (userData.generic.codeError === 'COD200') {
              const user = {
                id: userData.id,
                name: userData.names + ' ' + userData.lastNames,
                email: userData.email,
                phone: userData.phoneNumber || '+59100000000'
              }
              
              login(user, 'google_token_' + Date.now())
              toast.success('¡Cuenta creada con Google!')
              onSuccess?.()
            }
          }
        } catch (error) {
          console.error('Error getting user data after creation:', error)
          onError?.('Error al obtener datos del usuario')
        }
      } else {
        onError?.(response.msgError || 'Error al crear usuario de Google')
      }
    },
    onError: (error) => {
      console.error('Google user creation error:', error)
      onError?.('Error al crear usuario de Google')
    },
  })


  if (!isGoogleLoaded) {
    return (
      <div className="w-full">
        <button
          disabled
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 cursor-not-allowed"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
          Inicializando Google Login...
        </button>
        <p className="text-xs text-gray-400 mt-1 text-center">
          Cargando servicios de Google...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {isGoogleLoaded ? (
        <div 
          id="google-signin-button"
          className="w-full"
          style={{ 
            display: isLoading ? 'none' : 'block' 
          }}
        />
      ) : (
        <button
          disabled
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 cursor-not-allowed"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
          Cargando Google...
        </button>
      )}
      
      {isLoading && (
        <div className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
          Iniciando sesión...
        </div>
      )}
      
      {/* Mensaje de ayuda para desarrollo */}
      {!isGoogleLoaded && (
        <div className="mt-4 p-4 border border-yellow-300 rounded-md bg-yellow-50">
          <p className="text-yellow-800 text-sm">
            <strong>⚠️ Google Login no disponible</strong>
            <br />
            <span className="text-xs">
              Para habilitar Google Login, agrega <code className="bg-yellow-100 px-1 rounded">{window.location.origin}</code> 
              a las URLs autorizadas en Google Cloud Console.
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

