import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { apiService } from '../services/api'

export const TestConnection = () => {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testBackendConnection = async () => {
    setLoading(true)
    setStatus('Probando conexión...')
    
    try {
      // Probar conexión básica
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test123'
        })
      })
      if (response.ok) {
        const data = await response.json()
        setStatus(`✅ Backend conectado: ${JSON.stringify(data)}`)
      } else {
        setStatus(`❌ Backend respondió con status: ${response.status}`)
      }
    } catch (error) {
      setStatus(`❌ Error de conexión: ${error}`)
    }
    
    setLoading(false)
  }

  const testApiService = async () => {
    setLoading(true)
    setStatus('Probando API Service...')

    try {
      // Probar Google Login (validación de token)
      const googleResponse = await apiService().googleLogin({ token_id: 'test_google_token' })
      setStatus(`✅ Google Login - Validación: ${JSON.stringify(googleResponse, null, 2)}`)
    } catch (error) {
      setStatus(`❌ Error en Google Login: ${error}`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Prueba de Conexión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={testBackendConnection}
              disabled={loading}
              className="w-full"
            >
              Probar Conexión Backend
            </Button>
            
            <Button 
              onClick={testApiService}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Probar API Service
            </Button>
          </div>
          
          {status && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{status}</pre>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p><strong>Backend esperado:</strong> /api (proxy a http://localhost:3002/santiago-users)</p>
            <p><strong>WhatsApp esperado:</strong> http://localhost:3001</p>
            <p><strong>Nota:</strong> Usando proxy de Vite para evitar CORS</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
