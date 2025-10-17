import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PlusIcon, MapPinIcon, TrashIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/Loading'
import { MapComponent, DirectionsMap } from '../../components/maps/MapComponent'
import { apiService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import type { CreateDirectionRequest, UpdateDirectionRequest, Direction } from '../../types'

export const Addresses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDirection, setEditingDirection] = useState<Direction | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-17.389782, -66.1428]) // Cochabamba por defecto
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const { user } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateDirectionRequest>()

  // Cargar direcciones del usuario
  const { data: directionsData, isLoading, refetch } = useQuery({
    queryKey: ['directions', user?.id],
    queryFn: () => apiService().getUserDirections(user?.id || ''),
    enabled: !!user?.id,
  })

  // Mutación para crear dirección
  const createDirectionMutation = useMutation({
    mutationFn: (data: CreateDirectionRequest) => apiService().createDirection(data),
    onSuccess: (response) => {
      if (response.codeError === 'COD200') {
        toast.success('Dirección creada exitosamente')
        setIsModalOpen(false)
        reset()
        refetch()
      } else {
        toast.error(response.msgError || 'Error al crear dirección')
      }
    },
    onError: (error) => {
      console.error('Create direction error:', error)
      toast.error('Error al crear dirección')
    },
  })

  // Mutación para actualizar dirección
  const updateDirectionMutation = useMutation({
    mutationFn: (data: UpdateDirectionRequest) => apiService().updateDirection(data),
    onSuccess: (response) => {
      if (response.codeError === 'COD200') {
        toast.success('Dirección actualizada exitosamente')
        setIsModalOpen(false)
        setEditingDirection(null)
        reset()
        refetch()
      } else {
        toast.error(response.msgError || 'Error al actualizar dirección')
      }
    },
    onError: (error) => {
      console.error('Update direction error:', error)
      toast.error('Error al actualizar dirección')
    },
  })

  // Mutación para eliminar dirección
  const deleteDirectionMutation = useMutation({
    mutationFn: (locationID: string) => apiService().deleteDirection(locationID),
    onSuccess: (response) => {
      if (response.codeError === 'COD200') {
        toast.success('Dirección eliminada exitosamente')
        setDeleteConfirmId(null)
        refetch()
      } else {
        toast.error(response.msgError || 'Error al eliminar dirección')
      }
    },
    onError: (error) => {
      console.error('Delete direction error:', error)
      toast.error('Error al eliminar dirección')
    },
  })

  const onSubmit = (data: CreateDirectionRequest) => {
    console.log('Form data:', data) // Debug log
    console.log('Current user:', user) // Debug log
    
    if (editingDirection) {
      // Actualizar dirección existente
      const updateData: UpdateDirectionRequest = {
        location: data.location,
        lat: data.lat,
        lng: data.lng,
        alias: data.alias,
        url: data.url,
        locationID: editingDirection.id,
      }
      updateDirectionMutation.mutate(updateData)
    } else {
      // Crear nueva dirección
      if (user?.id) {
        const directionData = {
          ...data,
          userId: user.id,
        }
        console.log('Sending direction data:', directionData) // Debug log
        createDirectionMutation.mutate(directionData)
      } else {
        toast.error('No se pudo obtener el ID del usuario')
        console.error('User ID not available:', user)
      }
    }
  }

  const handleAddAddress = () => {
    setEditingDirection(null)
    setIsModalOpen(true)
    reset()
    setIsGettingLocation(true)
    
    // Obtener ubicación actual automáticamente
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setMapCenter([lat, lng])
          setValue('lat', lat)
          setValue('lng', lng)
          setIsGettingLocation(false)
          toast.success('Ubicación obtenida automáticamente')
        },
        (error) => {
          // Si falla la geolocalización, usar Cochabamba por defecto
          console.warn('Geolocation failed, using default location:', error)
          setMapCenter([-17.389782, -66.1428])
          setIsGettingLocation(false)
          toast('Usando ubicación por defecto (Cochabamba)', {
            icon: 'ℹ️',
          })
        }
      )
    } else {
      // Si no hay geolocalización, usar Cochabamba por defecto
      setMapCenter([-17.389782, -66.1428])
      setIsGettingLocation(false)
      toast('Geolocalización no disponible, usando ubicación por defecto', {
        icon: 'ℹ️',
      })
    }
  }

  const handleEditAddress = (direction: Direction) => {
    setEditingDirection(direction)
    setValue('location', direction.direction)
    setValue('lat', direction.lat)
    setValue('lng', direction.lng)
    setValue('alias', direction.alias)
    setMapCenter([direction.lat, direction.lng]) // Centrar en la dirección editada
    setIsModalOpen(true)
  }

  const handleDeleteAddress = (directionId: string) => {
    setDeleteConfirmId(directionId)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteDirectionMutation.mutate(deleteConfirmId)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setValue('lat', lat)
          setValue('lng', lng)
          setMapCenter([lat, lng])
          toast.success('Ubicación obtenida y mapa centrado')
        },
        (error) => {
          toast.error('No se pudo obtener la ubicación')
          console.error('Geolocation error:', error)
        }
      )
    } else {
      toast.error('Geolocalización no soportada')
    }
  }

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setValue('lat', lat)
    setValue('lng', lng)
    setMapCenter([lat, lng])
    toast.success('Ubicación seleccionada en el mapa')
  }

  const handleDirectionClick = (direction: Direction) => {
    setMapCenter([direction.lat, direction.lng])
    toast(`Vista centrada en: ${direction.alias}`, {
      icon: 'ℹ️',
    })
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  const directions = directionsData?.locationData || []

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Direcciones</h1>
            <p className="mt-2 text-gray-600">
              Gestiona tus direcciones de entrega
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowMap(!showMap)}
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
            </Button>
            <Button onClick={handleAddAddress}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Agregar Dirección
            </Button>
          </div>
        </div>
      </div>

      {/* Mapa de direcciones */}
      {showMap && directions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mapa de Direcciones</CardTitle>
          </CardHeader>
          <CardContent>
            <DirectionsMap
              directions={directions}
              center={mapCenter}
              onDirectionClick={handleDirectionClick}
              height="400px"
            />
          </CardContent>
        </Card>
      )}

      {directions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No tienes direcciones
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Agrega tu primera dirección para comenzar a recibir pedidos.
            </p>
            <div className="mt-6">
              <Button onClick={handleAddAddress}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Agregar Primera Dirección
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {directions.map((direction) => (
            <Card key={direction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{direction.alias}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAddress(direction)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteAddress(direction.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">{direction.direction}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    📍 Lat: {direction.lat.toFixed(6)}, Lng: {direction.lng.toFixed(6)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para agregar/editar dirección */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingDirection(null)
          reset()
        }}
        title={editingDirection ? "Editar Dirección" : "Agregar Nueva Dirección"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Alias"
            type="text"
            placeholder="Casa, Oficina, etc."
            error={errors.alias?.message}
            {...register('alias', {
              required: 'El alias es requerido',
              minLength: {
                value: 2,
                message: 'El alias debe tener al menos 2 caracteres',
              },
            })}
          />

          <Input
            label="Dirección"
            type="text"
            placeholder="Calle 123, Zona Centro, Cochabamba"
            error={errors.location?.message}
            {...register('location', {
              required: 'La dirección es requerida',
              minLength: {
                value: 5,
                message: 'La dirección debe tener al menos 5 caracteres',
              },
            })}
          />

                 <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <Input
                       label="Latitud"
                       type="number"
                       step="any"
                       placeholder="-17.389782"
                       error={errors.lat?.message}
                       {...register('lat', {
                         required: 'La latitud es requerida',
                         valueAsNumber: true,
                       })}
                     />

                     <Input
                       label="Longitud"
                       type="number"
                       step="any"
                       placeholder="-66.1428"
                       error={errors.lng?.message}
                       {...register('lng', {
                         required: 'La longitud es requerida',
                         valueAsNumber: true,
                       })}
                     />
                   </div>

                   {/* Mapa interactivo */}
                   <div>
                     <div className="flex items-center justify-between mb-2">
                       <label className="block text-sm font-medium text-gray-700">
                         Seleccionar ubicación en el mapa
                       </label>
                       <Button
                         type="button"
                         variant="outline"
                         size="sm"
                         onClick={getCurrentLocation}
                         className="text-xs"
                       >
                         📍 Centrar aquí
                       </Button>
                     </div>
                     <div className="relative">
                       {isGettingLocation && (
                         <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                           <div className="text-center">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                             <p className="text-sm text-gray-600 mt-2">Obteniendo tu ubicación...</p>
                           </div>
                         </div>
                       )}
                       <MapComponent
                         center={mapCenter}
                         onLocationSelect={handleMapLocationSelect}
                         selectedLocation={watch('lat') && watch('lng') ? [watch('lat'), watch('lng')] : null}
                         height="400px"
                         className="border border-gray-300 rounded-lg"
                       />
                     </div>
                     <p className="text-xs text-gray-500 mt-1">
                       El mapa se centró automáticamente en tu ubicación. Haz clic para ajustar o usa "Centrar aquí"
                     </p>
                   </div>
                 </div>

          <Input
            label="URL de Google Maps (opcional)"
            type="url"
            placeholder="https://maps.google.com/..."
            error={errors.url?.message}
            {...register('url')}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Puedes usar{' '}
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    mi ubicación actual
                  </button>{' '}
                  para obtener las coordenadas automáticamente.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                setEditingDirection(null)
                reset()
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={createDirectionMutation.isPending || updateDirectionMutation.isPending}
              disabled={createDirectionMutation.isPending || updateDirectionMutation.isPending}
            >
              {editingDirection ? 'Actualizar Dirección' : 'Agregar Dirección'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que quieres eliminar esta dirección? Esta acción no se puede deshacer.
          </p>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={deleteDirectionMutation.isPending}
              disabled={deleteDirectionMutation.isPending}
              className="flex-1"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


