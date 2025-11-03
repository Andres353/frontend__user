import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PlusIcon, MapPinIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/Loading'
import { MapComponent } from '../../components/maps/MapComponent'
import { apiService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import type { CreateDirectionRequest, UpdateDirectionRequest, Direction } from '../../types'

interface AddressesModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AddressesModal = ({ isOpen, onClose }: AddressesModalProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingDirection, setEditingDirection] = useState<Direction | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-17.389782, -66.1428]) // Cochabamba por defecto
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

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
    queryFn: () => {
      // Usar el ID del usuario para buscar las direcciones
      const userId = user?.id || ''
      console.log('🔍 Fetching directions for userId:', userId)
      return apiService().getUserDirections(userId)
    },
    enabled: !!user?.id && isOpen,
  })

  // Mutación para crear dirección
  const createDirectionMutation = useMutation({
    mutationFn: (data: CreateDirectionRequest) => {
      console.log('🔄 Calling createDirection with:', data)
      return apiService().createDirection(data)
    },
    onSuccess: (response) => {
      console.log('✅ createDirection response:', response)
      if (response.codeError === 'COD200') {
        console.log('✅ Dirección creada con ID:', response.msgError)
        toast.success('Dirección creada exitosamente')
        setIsAddModalOpen(false)
        reset()
        // Invalidar cache para refrescar la lista
        queryClient.invalidateQueries({ queryKey: ['directions', user?.id] })
        console.log('🔄 Cache invalidated for directions')
      } else {
        console.error('❌ Error from API:', response)
        toast.error(response.msgError || 'Error al crear dirección')
      }
    },
    onError: (error: any) => {
      console.error('❌ Create direction mutation error:', error)
      console.error('Error details:', error.response?.data)
      toast.error(`Error al crear dirección: ${error.response?.data?.msgError || error.message}`)
    },
  })

  // Mutación para actualizar dirección
  const updateDirectionMutation = useMutation({
    mutationFn: (data: UpdateDirectionRequest) => apiService().updateDirection(data),
    onSuccess: (response) => {
      if (response.codeError === 'COD200') {
        toast.success('Dirección actualizada exitosamente')
        setIsAddModalOpen(false)
        setEditingDirection(null)
        reset()
        // Invalidar cache para refrescar la lista
        queryClient.invalidateQueries({ queryKey: ['directions', user?.id] })
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
        // Invalidar cache para refrescar la lista
        queryClient.invalidateQueries({ queryKey: ['directions', user?.id] })
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
    
    // Verificar que el usuario esté disponible
    if (!user) {
      toast.error('Usuario no autenticado. Por favor, inicia sesión nuevamente.')
      onClose()
      return
    }
    
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
      console.log('Update data:', updateData) // Debug log
      updateDirectionMutation.mutate(updateData)
    } else {
      // Crear nueva dirección
      if (user?.email || user?.id) {
        // Intentar primero con el ID del usuario, y si no funciona, usar email
        // El backend parece esperar el ID de la base de datos, no el email
        const userId = user.id || (user.email && user.email.includes('@') ? user.email : '')
        
        const directionData = {
          ...data,
          userId: userId,
        }
        console.log('Sending direction data:', directionData) // Debug log
        console.log('Using userId:', userId) // Debug log
        console.log('Using user.id:', user.id) // Debug log
        console.log('Using user.email:', user.email) // Debug log
        createDirectionMutation.mutate(directionData)
      } else {
        toast.error('No se pudo obtener el ID del usuario')
        console.error('User ID not available:', user)
      }
    }
  }

  const handleAddAddress = () => {
    setEditingDirection(null)
    setIsAddModalOpen(true)
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
          console.warn('Geolocation failed, using default location:', error)
          setMapCenter([-17.389782, -66.1428])
          setIsGettingLocation(false)
          toast('Usando ubicación por defecto (Cochabamba)', {
            icon: 'ℹ️',
          })
        }
      )
    } else {
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
    setMapCenter([direction.lat, direction.lng])
    setIsAddModalOpen(true)
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
    toast.success('Ubicación seleccionada en el mapa')
  }

  const directions = directionsData?.locationData || []
  
  // Debug: Ver qué está retornando el API
  console.log('🔍 Directions data:', directionsData)
  console.log('📍 Directions count:', directions.length)
  console.log('📍 Directions list:', directions)

  return (
    <>
      {/* Modal principal de direcciones */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Mis Direcciones"
        size="xl"
      >
        <div className="space-y-6">
          {/* Botón agregar dirección */}
          <div className="flex justify-end">
            <Button onClick={handleAddAddress} className="bg-orange-600 hover:bg-orange-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Agregar Dirección
            </Button>
          </div>

          {/* Lista de direcciones */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : directions.length === 0 ? (
            <div className="text-center py-12">
              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No tienes direcciones
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Agrega tu primera dirección para comenzar a recibir pedidos.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {directions.map((direction) => (
                <Card key={direction.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{direction.alias}</h3>
                      <p className="text-sm text-gray-600 truncate">{direction.direction}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAddress(direction)}
                        className="h-8 w-8 p-0"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAddress(direction.id)}
                        className="h-8 w-8 p-0"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal para agregar/editar dirección */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
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
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Obteniendo tu ubicación...</p>
                    </div>
                  </div>
                )}
                <MapComponent
                  center={mapCenter}
                  onLocationSelect={handleMapLocationSelect}
                  selectedLocation={watch('lat') && watch('lng') ? [watch('lat'), watch('lng')] : null}
                  height="300px"
                  className="border border-gray-300 rounded-lg"
                  zoom={15}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Haz clic en el mapa para seleccionar una ubicación.
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

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setEditingDirection(null)
                reset()
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
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
    </>
  )
}
