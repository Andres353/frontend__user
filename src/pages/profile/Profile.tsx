import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types'

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const { user, updateUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<User>({
    defaultValues: user || {},
  })

  const updateUserMutation = useMutation({
    mutationFn: apiService.updateUser,
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data)
        toast.success('Perfil actualizado exitosamente')
        setIsEditing(false)
      }
    },
    onError: (error) => {
      console.error('Update user error:', error)
    },
  })

  const onSubmit = (data: User) => {
    updateUserMutation.mutate(data)
  }

  const handleEdit = () => {
    setIsEditing(true)
    reset(user || {})
  }

  const handleCancel = () => {
    setIsEditing(false)
    reset(user || {})
  }

  if (!user) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información del perfil */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información Personal</CardTitle>
                {!isEditing && (
                  <Button variant="outline" onClick={handleEdit}>
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Input
                    label="Nombre completo"
                    type="text"
                    error={errors.name?.message}
                    {...register('name', {
                      required: 'El nombre es requerido',
                      minLength: {
                        value: 2,
                        message: 'El nombre debe tener al menos 2 caracteres',
                      },
                    })}
                  />

                  <Input
                    label="Correo electrónico"
                    type="email"
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
                    error={errors.phone?.message}
                    {...register('phone', {
                      required: 'El número de teléfono es requerido',
                      pattern: {
                        value: /^\+591\d{8}$/,
                        message: 'Formato de teléfono inválido (+591XXXXXXXX)',
                      },
                    })}
                  />

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      isLoading={updateUserMutation.isPending}
                      disabled={updateUserMutation.isPending}
                    >
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nombre</p>
                      <p className="text-lg text-gray-900">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Correo electrónico</p>
                      <p className="text-lg text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Teléfono</p>
                      <p className="text-lg text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Estado de verificación */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Verificación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WhatsApp</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verificado
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verificado
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Verificar WhatsApp
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Cambiar contraseña
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Descargar datos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



