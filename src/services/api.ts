import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import toast from 'react-hot-toast'
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  User,
  AddAddressRequest,
  Address,
  AddBillingRequest,
  BillingData,
  SendCodeRequest,
  VerifyCodeRequest,
  WhatsAppResponse,
  ApiResponse,
  ApiError,
  CreateDirectionRequest,
  UpdateDirectionRequest,
  DirectionsResponse,
  Direction,
  GoogleLoginRequest,
  GoogleLoginResponse
} from '../types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    
    console.log('API Base URL:', baseURL) // Debug log
    console.log('Creating axios instance...') // Debug log
    
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Axios instance created:', this.api) // Debug log
    this.setupInterceptors()
    console.log('Interceptors setup complete') // Debug log
  }

  private setupInterceptors() {
    // Request interceptor para agregar token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor para manejar errores
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message,
          status: error.response?.status,
        }

        if (error.response?.data) {
          const data = error.response.data as any
          apiError.codeError = data.codeError
          apiError.msgError = data.msgError
        }

        // Mostrar error en toast
        toast.error(apiError.msgError || apiError.message || 'Error de conexión')

        return Promise.reject(apiError)
      }
    )
  }

  // Métodos de autenticación
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Attempting login with:', JSON.stringify(credentials, null, 2)) // Debug log
      console.log('this.api exists:', !!this.api) // Debug log
      
      if (!this.api) {
        throw new Error('API instance not initialized')
      }
      
      const response = await this.api.post<LoginResponse>('/login', credentials)
      console.log('Login response:', JSON.stringify(response.data, null, 2)) // Debug log
      return response.data
    } catch (error) {
      console.error('Login API error:', error) // Debug log
      throw error
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      console.log('Attempting register with:', userData) // Debug log
      const response = await this.api.post<RegisterResponse>('/add-user', userData)
      console.log('Register response:', JSON.stringify(response.data, null, 2)) // Debug log
      return response.data
    } catch (error) {
      console.error('Register API error:', error) // Debug log
      throw error
    }
  }

  async googleLogin(googleData: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    try {
      console.log('Attempting Google login with:', googleData) // Debug log
      const response = await this.api.post<GoogleLoginResponse>('/google-login', googleData)
      console.log('Google login response:', JSON.stringify(response.data, null, 2)) // Debug log
      return response.data
    } catch (error) {
      console.error('Google login API error:', error) // Debug log
      throw error
    }
  }

  async googleOperation(googleData: GoogleLoginRequest): Promise<ApiResponse> {
    try {
      console.log('Attempting Google operation with:', googleData) // Debug log
      const response = await this.api.post<ApiResponse>('/google-operation', googleData)
      console.log('Google operation response:', JSON.stringify(response.data, null, 2)) // Debug log
      return response.data
    } catch (error) {
      console.error('Google operation API error:', error) // Debug log
      throw error
    }
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>(`/get-user/${userId}`)
    return response.data
  }

  async getUserData(userId: string): Promise<any> {
    try {
      console.log('Getting user data for:', userId) // Debug log
      const response = await this.api.get(`/user-data?userid=${userId}`)
      console.log('User data response:', JSON.stringify(response.data, null, 2)) // Debug log
      return response.data
    } catch (error) {
      console.error('Get user data error:', error) // Debug log
      throw error
    }
  }

  async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.put<ApiResponse<User>>('/edit-user', userData)
    return response.data
  }

  // Métodos de direcciones
  async addAddress(addressData: AddAddressRequest): Promise<ApiResponse<Address>> {
    const response = await this.api.post<ApiResponse<Address>>('/add-direction', addressData)
    return response.data
  }

  async getAddresses(userId: string): Promise<ApiResponse<Address[]>> {
    const response = await this.api.get<ApiResponse<Address[]>>(`/get-directions/${userId}`)
    return response.data
  }

  // Métodos de facturación
  async addBilling(billingData: AddBillingRequest): Promise<ApiResponse<BillingData>> {
    const response = await this.api.post<ApiResponse<BillingData>>('/add-facturacion', billingData)
    return response.data
  }

  // Métodos de WhatsApp
  async sendVerificationCode(request: SendCodeRequest): Promise<WhatsAppResponse> {
    const response = await this.api.post<WhatsAppResponse>('/whatsapp/send-code', request)
    return response.data
  }

  async verifyCode(request: VerifyCodeRequest): Promise<WhatsAppResponse> {
    const response = await this.api.post<WhatsAppResponse>('/whatsapp/verify-code', request)
    return response.data
  }

  async getWhatsAppStatus(): Promise<WhatsAppResponse> {
    const response = await this.api.get<WhatsAppResponse>('/whatsapp/status')
    return response.data
  }

  // Métodos CRUD de direcciones
  async createDirection(directionData: CreateDirectionRequest): Promise<ApiResponse> {
    try {
      console.log('Creating direction:', directionData)
      const response = await this.api.post<ApiResponse>('/add-new-direction', directionData)
      console.log('Create direction response:', JSON.stringify(response.data, null, 2))
      return response.data
    } catch (error) {
      console.error('Create direction error:', error)
      throw error
    }
  }

  async updateDirection(directionData: UpdateDirectionRequest): Promise<ApiResponse> {
    try {
      console.log('Updating direction:', directionData)
      const response = await this.api.put<ApiResponse>('/edit-direction', directionData)
      console.log('Update direction response:', JSON.stringify(response.data, null, 2))
      return response.data
    } catch (error) {
      console.error('Update direction error:', error)
      throw error
    }
  }

  async deleteDirection(locationID: string): Promise<ApiResponse> {
    try {
      console.log('Deleting direction:', locationID)
      const response = await this.api.delete<ApiResponse>(`/delete-direction?id=${locationID}`)
      console.log('Delete direction response:', JSON.stringify(response.data, null, 2))
      return response.data
    } catch (error) {
      console.error('Delete direction error:', error)
      throw error
    }
  }

  async getUserDirections(userId: string): Promise<DirectionsResponse> {
    try {
      console.log('Getting directions for user:', userId)
      const response = await this.api.get<DirectionsResponse>(`/user-directions?userid=${userId}`)
      console.log('Get directions response:', JSON.stringify(response.data, null, 2))
      return response.data
    } catch (error) {
      console.error('Get directions error:', error)
      throw error
    }
  }
}

// Crear instancia de forma lazy para evitar problemas de inicialización
let apiServiceInstance: ApiService | null = null

export const apiService = (): ApiService => {
  if (!apiServiceInstance) {
    console.log('Creating new API service instance...')
    apiServiceInstance = new ApiService()
  }
  return apiServiceInstance
}

export default apiService
