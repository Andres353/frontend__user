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
import type { RegisterRequest } from '../../types'

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest & { confirmPassword: string }>()

  const password = watch('password')

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => apiService().register(data),
    onSuccess: (response) => {
      console.log('Register response:', response) // Debug log
      toast.success('¡Cuenta creada exitosamente!')
      navigate('/login')
    },
    onError: (error) => {
      console.error('Register error:', error) // Debug log
    },
  })

  const onSubmit = (data: RegisterRequest & { confirmPassword: string }) => {
    const { confirmPassword, ...registerData } = data
    console.log('Sending register data:', registerData) // Debug log
    registerMutation.mutate(registerData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-green hover:text-green-600"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Regístrate en Santiago Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Nombres"
                type="text"
                placeholder="Rodrigo Antonio"
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
                placeholder="Gutiérrez Flores"
                error={errors.lastNames?.message}
                {...register('lastNames', {
                  required: 'Los apellidos son requeridos',
                  minLength: {
                    value: 2,
                    message: 'Los apellidos deben tener al menos 2 caracteres',
                  },
                })}
              />

              <Input
                label="Correo electrónico"
                type="email"
                placeholder="tu@email.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'El correo electrónico es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo electrónico inválido',
                  },
                })}
              />

              <Input
                label="Número de teléfono"
                type="tel"
                placeholder="+59193811223"
                error={errors.phoneNumber?.message}
                {...register('phoneNumber', {
                  required: 'El número de teléfono es requerido',
                  pattern: {
                    value: /^\+591\d{8}$/,
                    message: 'Formato de teléfono inválido (+591XXXXXXXX)',
                  },
                })}
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
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

              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="Confirma tu contraseña"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: (value) =>
                    value === password || 'Las contraseñas no coinciden',
                })}
              />

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-green focus:ring-primary-blue border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  Acepto los{' '}
                  <a href="#" className="text-primary-green hover:text-green-600">
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="#" className="text-primary-green hover:text-green-600">
                    política de privacidad
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={registerMutation.isPending}
                disabled={registerMutation.isPending}
              >
                Crear Cuenta
              </Button>
            </form>

            {/* Separador */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O regístrate con</span>
                </div>
              </div>
            </div>

            {/* Google Login Button */}
            <div className="mt-6">
              <GoogleLoginButton
                onSuccess={() => {
                  toast.success('¡Cuenta creada con Google!')
                  navigate('/profile')
                }}
                onError={(error) => {
                  toast.error(error)
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Al registrarte, podrás verificar tu número de WhatsApp para recibir notificaciones.
          </p>
        </div>
      </div>
    </div>
  )
}
