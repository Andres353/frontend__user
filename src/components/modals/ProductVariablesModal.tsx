import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { apiService } from '@/services/api'

interface VariableWithPricing {
  id: string
  name: string
  canMany?: boolean
  required?: boolean
  instructions?: string
  productsId?: string
  quantity?: number
  pricing: Array<{
    id: string
    name: string
    price: number
    pv?: string  // ID de la variable del producto
    variableId?: string
  }>
}

interface ProductVariablesModalProps {
  isOpen: boolean
  onClose: () => void
  productId?: string
  productName: string
  productVariables?: Array<{
    id: string
    name: string
    canMany: boolean
    required: boolean
    instructions?: string
    quantity?: number
    pricingBean: Array<{
      id: string
      name: string
      price: number
      pv: string
    }>
  }>
  onConfirm: (selectedVariables: Array<{
    variableName: string
    optionName: string
    price: number
  }>) => void
}

export const ProductVariablesModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  productVariables,
  onConfirm
}: ProductVariablesModalProps) => {
  const [variables, setVariables] = useState<VariableWithPricing[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (productVariables && productVariables.length > 0) {
        // Usar las variables directamente del producto
        loadVariablesFromProduct()
      } else if (productId) {
        // Fallback: cargar desde API si no vienen con el producto
        loadProductVariables()
      } else {
        // No hay variables
        onConfirm([])
      }
    }
  }, [isOpen, productVariables, productId])

  const loadVariablesFromProduct = () => {
    if (!productVariables) return
    
    try {
      setLoading(true)
      // Convertir las variables del formato del producto al formato del modal
      const convertedVariables: VariableWithPricing[] = productVariables.map((pv) => ({
        id: pv.id,
        name: pv.name,
        canMany: pv.canMany,
        required: pv.required,
        instructions: pv.instructions,
        quantity: pv.quantity,
        pricing: pv.pricingBean.map((pricing) => ({
          id: pricing.id,
          name: pricing.name,
          price: pricing.price,
          pv: pricing.pv,
          variableId: pv.id
        }))
      }))
      
      setVariables(convertedVariables)
      
      // Pre-seleccionar la primera opción de cada variable si existe
      const initialSelection: Record<string, string> = {}
      convertedVariables.forEach((variable) => {
        if (variable.pricing && variable.pricing.length > 0) {
          initialSelection[variable.id] = variable.pricing[0].id
        }
      })
      setSelectedOptions(initialSelection)
    } catch (error) {
      console.error('Error loading product variables:', error)
      onConfirm([])
    } finally {
      setLoading(false)
    }
  }

  const loadProductVariables = async () => {
    if (!productId) return
    
    try {
      setLoading(true)
      const response = await apiService().getProductVariablesWithPricing(productId)
      
      if (response.variables && response.variables.length > 0) {
        setVariables(response.variables)
        
        // Pre-seleccionar la primera opción de cada variable si existe
        const initialSelection: Record<string, string> = {}
        response.variables.forEach((variable: VariableWithPricing) => {
          if (variable.pricing && variable.pricing.length > 0) {
            initialSelection[variable.id] = variable.pricing[0].id
          }
        })
        setSelectedOptions(initialSelection)
      } else {
        // Si no hay variables, confirmar directamente
        onConfirm([])
      }
    } catch (error) {
      console.error('Error loading product variables:', error)
      // Si hay error, asumir que no hay variables
      onConfirm([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (variableId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [variableId]: optionId
    }))
  }

  const handleConfirm = () => {
    const selectedVariables = variables.map(variable => {
      const selectedOptionId = selectedOptions[variable.id]
      const selectedOption = variable.pricing.find(p => p.id === selectedOptionId)
      
      if (!selectedOption) {
        // Si la variable es requerida pero no se seleccionó, usar la primera opción
        if (variable.pricing && variable.pricing.length > 0) {
          const firstOption = variable.pricing[0]
          return {
            variableName: variable.name,
            optionName: firstOption.name,
            price: firstOption.price
          }
        }
        return null
      }
      
      return {
        variableName: variable.name,
        optionName: selectedOption.name,
        price: selectedOption.price
      }
    }).filter(Boolean) as Array<{
      variableName: string
      optionName: string
      price: number
    }>

    onConfirm(selectedVariables)
    onClose()
  }

  const calculateTotalPrice = () => {
    let total = 0
    
    variables.forEach(variable => {
      const selectedOptionId = selectedOptions[variable.id]
      const selectedOption = variable.pricing.find(p => p.id === selectedOptionId)
      
      if (selectedOption) {
        total += selectedOption.price
      } else if (variable.pricing && variable.pricing.length > 0) {
        // Si no se seleccionó, usar la primera opción
        total += variable.pricing[0].price
      }
    })
    
    return total
  }

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Cargando opciones...">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando opciones del producto...</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Personalizar: ${productName}`}>
      <div className="space-y-6">
        {variables.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Este producto no tiene opciones de personalización.</p>
          </div>
        ) : (
          <>
            {variables.map((variable) => (
              <div key={variable.id} className="space-y-3">
                <h3 className="font-semibold text-lg">
                  {variable.name}
                  {(variable.required || variable.canMany) && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {variable.instructions && (
                  <p className="text-sm text-gray-500">{variable.instructions}</p>
                )}
                <div className="space-y-2">
                  {variable.pricing.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedOptions[variable.id] === option.id
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => handleSelectOption(variable.id, option.id)}
                    >
                      <input
                        type="radio"
                        name={`variable-${variable.id}`}
                        value={option.id}
                        checked={selectedOptions[variable.id] === option.id}
                        onChange={() => handleSelectOption(variable.id, option.id)}
                        className="mr-3 h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium">{option.name}</span>
                      </div>
                      <span className="text-orange-600 font-semibold">
                        +Bs. {option.price.toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total adicional:</span>
                <span className="text-2xl font-bold text-orange-600">
                  +Bs. {calculateTotalPrice().toFixed(2)}
                </span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  Agregar al carrito
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

