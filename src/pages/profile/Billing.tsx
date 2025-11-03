import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  DocumentTextIcon, 
  BuildingOfficeIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import type { AddFacturaRequest, EditFacturaRequest, FacturaData } from '@/types'

export const Billing = () => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingFactura, setEditingFactura] = useState<FacturaData | null>(null)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AddFacturaRequest | EditFacturaRequest>()

  // Query para obtener las facturaciones existentes
  const { data: facturasData, refetch: refetchFacturas, isLoading, error: facturasError } = useQuery({
    queryKey: ['facturas', user?.id],
    queryFn: async () => {
      try {
        console.log('Fetching facturas for user:', user?.id)
        const result = await apiService().getFacturas(user?.id || '')
        console.log('Facturas response:', JSON.stringify(result, null, 2))
        console.log('Facturas count:', result.facturaciones?.length || 0)
        return result
      } catch (error) {
        console.error('Error fetching facturas:', error)
        throw error
      }
    },
    enabled: !!user?.id,
    retry: 1,
  })

  // Query para obtener pedidos del usuario
  const { data: pedidosData, isLoading: pedidosLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      try {
        console.log('Fetching pedidos...')
        const result = await apiService().getPedidos(0, 10) // página 0, tamaño 10
        console.log('Pedidos response:', JSON.stringify(result, null, 2))
        return result
      } catch (error) {
        console.error('Error fetching pedidos:', error)
        // No lanzar error para evitar que rompa la UI si el backend de pedidos no está disponible
        return { 
          ordersData: [], 
          comisionTotal: 0, 
          totalPages: 0, 
          pageNumber: 0,
          entereza: { codeError: 'ERROR', msgError: 'Servicio de pedidos no disponible' }
        }
      }
    },
    retry: 1,
  })

  const addFacturaMutation = useMutation({
    mutationFn: (data: AddFacturaRequest) => apiService().addFactura(data),
    onSuccess: (response) => {
      if (response.codeError === 'COD200') {
        toast.success('Datos de facturación guardados exitosamente')
        setShowAddForm(false)
        reset()
        refetchFacturas()
      } else {
        toast.error(response.msgError || 'Error al guardar los datos')
      }
    },
    onError: (error) => {
      console.error('Add factura error:', error)
      toast.error('Error al guardar los datos de facturación')
    },
  })

  const editFacturaMutation = useMutation({
    mutationFn: (data: EditFacturaRequest) => apiService().editFactura(data),
    onSuccess: (response) => {
      if (response.codeError === 'COD200') {
        toast.success('Facturación actualizada exitosamente')
        setEditingFactura(null)
        reset()
        setShowAddForm(false)
        refetchFacturas()
      } else {
        toast.error(response.msgError || 'Error al actualizar la facturación')
      }
    },
    onError: (error) => {
      console.error('Edit factura error:', error)
      toast.error('Error al actualizar la facturación')
    },
  })

  const deleteFacturaMutation = useMutation({
    mutationFn: (facturaId: string) => apiService().deleteFactura(facturaId),
    onSuccess: (response) => {
      if (response.codeError === 'COD200') {
        toast.success('Facturación eliminada exitosamente')
        refetchFacturas()
      } else {
        toast.error(response.msgError || 'Error al eliminar la facturación')
      }
    },
    onError: (error) => {
      console.error('Delete factura error:', error)
      toast.error('Error al eliminar la facturación')
    },
  })

  const onSubmit = (data: AddFacturaRequest | EditFacturaRequest) => {
    if (editingFactura) {
      // Editar facturación existente
      editFacturaMutation.mutate({
        id: editingFactura.id,
        razonSocial: data.razonSocial,
        nit: data.nit,
      })
    } else if (user?.id) {
      // Crear nueva facturación
      console.log('User object:', user)
      console.log('User ID being sent:', user.id)
      console.log('Full data being sent:', {
        ...data,
        userID: user.id,
      })
      
      addFacturaMutation.mutate({
        ...data,
        userID: user.id, // Usar ID del usuario
        userEmail: user.email, // Email como fallback
      } as AddFacturaRequest & { userEmail?: string })
    }
  }

  const handleAddNew = () => {
    setEditingFactura(null)
    setShowAddForm(true)
    reset()
  }

  const handleEdit = (factura: FacturaData) => {
    setEditingFactura(factura)
    setShowAddForm(true)
    setValue('razonSocial', factura.razonSocial)
    setValue('nit', factura.nit)
  }

  const handleDelete = (facturaId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta facturación?')) {
      deleteFacturaMutation.mutate(facturaId)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingFactura(null)
    reset()
  }

  // Funciones para calcular estadísticas de pedidos
  const getPedidosStats = () => {
    if (!pedidosData?.ordersData) {
      return {
        total: 0,
        activos: 0,
        pendientes: 0,
        completados: 0,
        cancelados: 0
      }
    }

    const pedidos = pedidosData.ordersData
    return {
      total: pedidos.length,
      activos: pedidos.filter(p => [1, 2, 3].includes(p.status)).length, // Estados activos según API
      pendientes: pedidos.filter(p => p.status === 0).length, // Estado pendiente
      completados: pedidos.filter(p => p.status === 4).length, // Estado entregado
      cancelados: pedidos.filter(p => p.status === 5).length // Estado cancelado
    }
  }

  const getPedidosRecientes = () => {
    if (!pedidosData?.ordersData) return []
    
    return pedidosData.ordersData
      .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
      .slice(0, 3)
  }

  const stats = getPedidosStats()
  const pedidosRecientes = getPedidosRecientes()

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facturación y Pedidos</h1>
            <p className="mt-2 text-gray-600">
              Gestiona tus datos de facturación y realiza pedidos
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/hacer-pedido')} 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              Hacer Pedido
            </Button>
            <Button 
              onClick={() => navigate('/pedidos')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              Ver Pedidos
            </Button>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Agregar Facturación
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Facturaciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {facturasData?.facturaciones?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCartIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pedidos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guía de proceso de pedidos */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">¿Cómo hacer un pedido?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Datos de Facturación</h3>
              <p className="text-sm text-gray-600">Registra tu información fiscal para las facturas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Direcciones</h3>
              <p className="text-sm text-gray-600">Agrega tus direcciones de entrega</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Seleccionar Empresa</h3>
              <p className="text-sm text-gray-600">Elige la empresa y sucursal</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold text-lg">4</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Carrito y Pedido</h3>
              <p className="text-sm text-gray-600">Agrega productos y confirma tu pedido</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Button 
              onClick={() => navigate('/hacer-pedido')} 
              className="bg-green-600 hover:bg-green-700"
            >
              Comenzar Pedido
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Lista de facturaciones */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Datos de Facturación</CardTitle>
                <Button onClick={handleAddNew} size="sm" className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : facturasError ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">Error al cargar las facturaciones</p>
                  <Button
                    onClick={() => refetchFacturas()}
                    variant="outline"
                    size="sm"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (() => {
                console.log('Rendering facturas - facturasData:', facturasData)
                console.log('facturasData.facturaciones:', facturasData?.facturaciones)
                console.log('facturasData.facturaciones.length:', facturasData?.facturaciones?.length)
                return facturasData?.facturaciones && facturasData.facturaciones.length > 0
              })() ? (
                <div className="space-y-3">
                  {facturasData?.facturaciones?.map((factura: FacturaData) => (
                    <div key={factura.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900">
                              {factura.razonSocial}
                            </h3>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p><strong>NIT:</strong> {factura.nit}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEdit(factura)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDelete(factura.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay datos de facturación
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Agrega tus datos de facturación para poder realizar pedidos
                  </p>
                  <Button onClick={handleAddNew} className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Agregar Facturación
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Área de pedidos (preparada para implementación) */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pedidos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {pedidosLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : pedidosRecientes.length > 0 ? (
                <div className="space-y-4">
                  {pedidosRecientes.map((pedido) => (
                    <div key={pedido.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Pedido #{pedido.orderCode || pedido.id.slice(-6)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pedido.status === 4 ? 'bg-green-100 text-green-800' : // Entregado
                          pedido.status === 0 ? 'bg-yellow-100 text-yellow-800' : // Pendiente
                          pedido.status === 5 ? 'bg-red-100 text-red-800' : // Cancelado
                          'bg-blue-100 text-blue-800' // Otros estados
                        }`}>
                          {pedido.status === 0 ? 'Pendiente' :
                           pedido.status === 1 ? 'Confirmado' :
                           pedido.status === 2 ? 'Preparando' :
                           pedido.status === 3 ? 'En Camino' :
                           pedido.status === 4 ? 'Entregado' :
                           pedido.status === 5 ? 'Cancelado' :
                           `Estado ${pedido.status}`}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Total: ${pedido.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(pedido.creationDate).toLocaleDateString()}
                        </p>
                        {pedido.clientName && (
                          <p className="text-xs text-gray-500">
                            Cliente: {pedido.clientName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay pedidos recientes
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tus pedidos aparecerán aquí
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de formulario de facturación */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingFactura ? 'Editar Facturación' : 'Agregar Facturación'}
                </h2>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Razón Social"
                  placeholder="Nombre de la empresa"
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
                  label="NIT"
                  placeholder="Número de identificación tributaria"
                  error={errors.nit?.message}
                  {...register('nit', {
                    required: 'El NIT es requerido',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'El NIT debe contener solo números',
                    },
                  })}
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={addFacturaMutation.isPending || editFacturaMutation.isPending}
                    disabled={addFacturaMutation.isPending || editFacturaMutation.isPending}
                  >
                    {editingFactura ? 'Actualizar' : 'Guardar Datos'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}