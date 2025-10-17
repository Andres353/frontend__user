import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { DocumentTextIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import type { AddBillingRequest } from '@/types'

export const Billing = () => {
  const [isEditing, setIsEditing] = useState(false)
  const { user } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddBillingRequest>()

  const addBillingMutation = useMutation({
    mutationFn: apiService.addBilling,
    onSuccess: () => {
      toast.success('Datos de facturación guardados exitosamente')
      setIsEditing(false)
    },
    onError: (error) => {
      console.error('Add billing error:', error)
    },
  })

  const onSubmit = (data: AddBillingRequest) => {
    if (user?.id) {
      addBillingMutation.mutate({
        ...data,
        userId: user.id,
      })
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    reset()
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
        <p className="mt-2 text-gray-600">
          Configura tus datos de facturación para recibir comprobantes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de facturación */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Datos de Facturación</CardTitle>
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
                    label="NIT"
                    type="text"
                    placeholder="123456789"
                    error={errors.nit?.message}
                    {...register('nit', {
                      required: 'El NIT es requerido',
                      pattern: {
                        value: /^\d{7,15}$/,
                        message: 'El NIT debe contener entre 7 y 15 dígitos',
                      },
                    })}
                  />

                  <Input
                    label="Razón Social"
                    type="text"
                    placeholder="Juan Pérez"
                    error={errors.razonSocial?.message}
                    {...register('razonSocial', {
                      required: 'La razón social es requerida',
                      minLength: {
                        value: 2,
                        message: 'La razón social debe tener al menos 2 caracteres',
                      },
                    })}
                  />

                  <Input
                    label="Dirección Fiscal"
                    type="text"
                    placeholder="Av. 6 de Agosto 1234, La Paz"
                    error={errors.direccion?.message}
                    {...register('direccion', {
                      required: 'La dirección fiscal es requerida',
                      minLength: {
                        value: 10,
                        message: 'La dirección debe tener al menos 10 caracteres',
                      },
                    })}
                  />

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>Importante:</strong> Los datos de facturación deben coincidir exactamente 
                          con los registros fiscales para que las facturas sean válidas.
                        </p>
                      </div>
                    </div>
                  </div>

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
                      isLoading={addBillingMutation.isPending}
                      disabled={addBillingMutation.isPending}
                    >
                      Guardar Datos
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">NIT</p>
                      <p className="text-lg text-gray-900">123456789</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Razón Social</p>
                      <p className="text-lg text-gray-900">Juan Pérez</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dirección Fiscal</p>
                      <p className="text-lg text-gray-900">Av. 6 de Agosto 1234, La Paz</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Información sobre facturación */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">¿Para qué sirve?</p>
                  <p>
                    Los datos de facturación te permiten recibir comprobantes 
                    fiscales válidos por tus compras.
                  </p>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">¿Es obligatorio?</p>
                  <p>
                    No es obligatorio, pero te recomendamos configurarlo 
                    para recibir facturas fiscales.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado de configuración */}
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Configuración</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completa
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Facturas disponibles</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Sí
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



