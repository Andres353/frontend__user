import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton'
import { apiService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import type { LoginRequest } from '../../types'

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>()

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      // Paso 1: Validar credenciales
      const loginResponse = await apiService().login(data)
      console.log('Login validation response:', loginResponse) // Debug log
      
      if (loginResponse.codeError === 'COD200') {
        // Paso 2: Obtener datos del usuario
        const userData = await apiService().getUserData(data.id)
        console.log('User data response:', userData) // Debug log
        
        if (userData.generic.codeError === 'COD200') {
          // Paso 3: Crear objeto usuario con datos reales
          const user = {
            id: userData.id, // ID real del usuario
            name: userData.names + ' ' + userData.lastNames, // Nombre completo
            email: userData.email,
            phone: userData.phoneNumber
          }
          
          console.log('Final user object:', user) // Debug log
          return { user, token: 'temp_token_' + Date.now() }
        } else {
          throw new Error(userData.generic.msgError || 'Error al obtener datos del usuario')
        }
      } else {
        throw new Error(loginResponse.msgError || 'Error en el login')
      }
    },
    onSuccess: (data) => {
      console.log('Login success with user data:', data) // Debug log
      login(data.user, data.token)
      toast.success('¡Bienvenido!')
      navigate('/addresses')
    },
    onError: (error: unknown) => {
      console.error('Login error:', error)
      const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Error en el login')
      toast.error(message)
    },
  })

  const onSubmit = (data: LoginRequest) => {
    console.log('Form submitted with data:', data)
    console.log('API service function:', apiService)
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-orange rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-orange hover:text-green-600"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Accede a tu cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email o ID de usuario"
                type="text"
                placeholder="tu@email.com o ID de usuario"
                error={errors.id?.message}
                {...register('id', {
                  required: 'El email o ID es requerido',
                })}
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  error={errors.password?.message}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  }
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres',
                    },
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-orange focus:ring-primary-blue border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-orange hover:text-green-600">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={loginMutation.isPending}
                disabled={loginMutation.isPending}
              >
                Iniciar Sesión
              </Button>
            </form>

            {/* Separador */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
              </div>
            </div>

            {/* Google Login Button */}
            <div className="mt-6">
              <GoogleLoginButton
                onSuccess={() => {
                  toast.success('¡Bienvenido con Google!')
                  navigate('/addresses')
                }}
                onError={(error: unknown) => {
                  const message = error instanceof Error ? error.message : String(error)
                  toast.error(message)
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Puedes usar tu email o ID de usuario para iniciar sesión.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            ¿Necesitas verificar tu WhatsApp?{' '}
            <Link
              to="/verify-whatsapp"
              className="font-medium text-primary-orange hover:text-green-600"
            >
              Verificar número
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
