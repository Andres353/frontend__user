// Configuración de Google Identity Services
export const GOOGLE_CLIENT_ID = '867478989787-6h0re6ipld94akr6jif2vsrn6ngq6ffc.apps.googleusercontent.com'

// Variable global para almacenar el callback
let globalGoogleCallback: ((response: any) => void) | null = null

// Inicializar Google Identity Services
export const initializeGoogle = (callback?: (response: any) => void) => {
  if (typeof window !== 'undefined' && window.google) {
    if (callback) {
      globalGoogleCallback = callback
    }
    
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: false, // Deshabilitar FedCM
      ux_mode: 'popup', // Usar popup en lugar de One Tap
    })
  }
}

// Manejar respuesta de Google
const handleGoogleResponse = (response: any) => {
  console.log('Google response received:', response)
  if (globalGoogleCallback) {
    globalGoogleCallback(response)
  }
}

// Cargar script de Google Identity Services
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'))
      return
    }

    if (window.google?.accounts?.id) {
      console.log('✅ Google script ya está cargado')
      resolve()
      return
    }

    console.log('📥 Cargando script de Google Identity Services...')
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('✅ Script de Google cargado exitosamente')
      resolve()
    }
    script.onerror = () => {
      console.error('❌ Error al cargar script de Google')
      reject(new Error('Failed to load Google script'))
    }
    
    document.head.appendChild(script)
  })
}

// Declarar tipos globales para TypeScript
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
  }
}

