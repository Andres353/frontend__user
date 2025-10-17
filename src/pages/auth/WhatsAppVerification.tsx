import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { apiService } from '@/services/api'
import type { SendCodeRequest, VerifyCodeRequest } from '@/types'

interface VerificationForm {
  phoneNumber: string
  verificationCode: string
}

export const WhatsAppVerification = () => {
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VerificationForm>()

  const sendCodeMutation = useMutation({
    mutationFn: apiService.sendVerificationCode,
    onSuccess: (response) => {
      toast.success(response.msgError)
      setStep('code')
    },
    onError: (error) => {
      console.error('Send code error:', error)
    },
  })

  const verifyCodeMutation = useMutation({
    mutationFn: apiService.verifyCode,
    onSuccess: (response) => {
      toast.success('¡Número verificado exitosamente!')
      setStep('phone')
      setPhoneNumber('')
      reset()
    },
    onError: (error) => {
      console.error('Verify code error:', error)
    },
  })

  const onSendCode = (data: SendCodeRequest) => {
    setPhoneNumber(data.phoneNumber)
    sendCodeMutation.mutate(data)
  }

  const onVerifyCode = (data: VerifyCodeRequest) => {
    verifyCodeMutation.mutate(data)
  }

  const handleBackToPhone = () => {
    setStep('phone')
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verificación WhatsApp
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Verifica tu número de teléfono para recibir notificaciones
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'phone' ? 'Enviar código' : 'Verificar código'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handleSubmit(onSendCode)} className="space-y-6">
                <Input
                  label="Número de teléfono"
                  type="tel"
                  placeholder="+59178984335"
                  error={errors.phoneNumber?.message}
                  {...register('phoneNumber', {
                    required: 'El número de teléfono es requerido',
                    pattern: {
                      value: /^\+591\d{8}$/,
                      message: 'Formato de teléfono inválido (+591XXXXXXXX)',
                    },
                  })}
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
                        Te enviaremos un código de verificación por WhatsApp. 
                        Asegúrate de que el número esté correcto.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={sendCodeMutation.isPending}
                  disabled={sendCodeMutation.isPending}
                >
                  Enviar Código
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit(onVerifyCode)} className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Código enviado a: <span className="font-medium">{phoneNumber}</span>
                  </p>
                </div>

                <Input
                  label="Código de verificación"
                  type="text"
                  placeholder="123456"
                  error={errors.verificationCode?.message}
                  {...register('verificationCode', {
                    required: 'El código de verificación es requerido',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'El código debe tener 6 dígitos',
                    },
                  })}
                />

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Revisa tu WhatsApp para el código de 6 dígitos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToPhone}
                  >
                    Cambiar número
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={verifyCodeMutation.isPending}
                    disabled={verifyCodeMutation.isPending}
                  >
                    Verificar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No recibiste el código?{' '}
            <button
              onClick={() => step === 'code' && sendCodeMutation.mutate({ phoneNumber })}
              className="font-medium text-primary-green hover:text-green-600"
              disabled={sendCodeMutation.isPending}
            >
              Reenviar código
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

