import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { 
  EnvelopeIcon, 
  UserIcon, 
  PhoneIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import type { RegisterRequest } from '@/types'

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<RegisterRequest & { confirmPassword: string }>()

  const password = watch('password')

  // Mutación para registro con email
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => apiService().register(data),
    onSuccess: (response) => {
      if (response.codeError === 'COD200') {
        toast.success('Usuario creado exitosamente')
        // Después del registro exitoso, hacer login automático
        navigate('/login')
      } else if (response.codeError === 'COD353') {
        toast.error('Esta cuenta ya existe. Intenta iniciar sesión.')
        navigate('/login')
      } else {
        toast.error(response.msgError || 'Error al crear usuario')
      }
    },
    onError: (error) => {
      console.error('Register error:', error)
      toast.error('Error al crear usuario')
    },
  })

  const onSubmit = (data: RegisterRequest & { confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    const { confirmPassword, ...registerData } = data
    registerMutation.mutate(registerData)
  }

  const handleGoogleSuccess = () => {
    // El login ya se maneja en GoogleLoginButton
    navigate('/')
  }

  const handleGoogleError = (error: string) => {
    console.error('Google login error:', error)
    if (error.includes('configuración') || error.includes('origen')) {
      toast.error('Google Login no está configurado para este dominio. Usa el registro con email.')
    } else {
      toast.error('Error al iniciar sesión con Google')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">SD</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete a Santiago Delivery
          </p>
        </div>

        {/* Opciones de registro */}
        <div className="space-y-6">
          {/* Registro con Google */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Registro Rápido con Google
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Regístrate en segundos con tu cuenta de Google
                </p>
                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="Continuar con Google"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Si Google Login no funciona, usa el registro con email abajo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-orange-50 to-blue-50 text-gray-500">
                O regístrate con email
              </span>
            </div>
          </div>

          {/* Registro con Email */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nombres"
                    type="text"
                    placeholder="Juan"
                    error={errors.names?.message}
                    {...register('names', {
                      required: 'Los nombres son requeridos',
                      minLength: {
                        value: 2,
                        message: 'Los nombres deben tener al menos 2 caracteres',
                      },
                    })}
                  />
                  <Input
                    label="Apellidos"
                    type="text"
                    placeholder="Pérez"
                    error={errors.lastNames?.message}
                    {...register('lastNames', {
                      required: 'Los apellidos son requeridos',
                      minLength: {
                        value: 2,
                        message: 'Los apellidos deben tener al menos 2 caracteres',
                      },
                    })}
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="12345678"
                  error={errors.phoneNumber?.message}
                  {...register('phoneNumber', {
                    required: 'El teléfono es requerido',
                    pattern: {
                      value: /^[0-9]{8,}$/,
                      message: 'Teléfono inválido (mínimo 8 dígitos)',
                    },
                  })}
                />

                <div className="relative">
                  <Input
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'La contraseña debe tener al menos 6 caracteres',
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                      required: 'Confirma tu contraseña',
                      validate: (value) =>
                        value === password || 'Las contraseñas no coinciden',
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  isLoading={registerMutation.isPending}
                  disabled={registerMutation.isPending}
                >
                  Crear Cuenta
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}