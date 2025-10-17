// Tipos de usuario
export interface User {
  id: string
  name: string
  email: string
  phone: string
  createdAt?: string
  updatedAt?: string
}

// Tipos de autenticación
export interface LoginRequest {
  id: string
  password: string
}

export interface LoginResponse {
  codeError: string
  msgError: string
  data?: {
    user: User
    token: string
  }
}

export interface GoogleLoginRequest {
  token_id: string
}

export interface GoogleLoginResponse {
  codeError: string
  msgError: string
  data?: {
    user: User
    token: string
  }
}

export interface RegisterRequest {
  names: string
  lastNames: string
  email: string
  phoneNumber: string
  password: string
}

export interface RegisterResponse {
  codeError: string
  msgError: string
}

// Tipos de dirección
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Address {
  id: string
  userId: string
  address: string
  city: string
  coordinates: Coordinates
  createdAt?: string
  updatedAt?: string
}

export interface AddAddressRequest {
  userId: string
  address: string
  city: string
  coordinates: Coordinates
}

// Nuevos tipos para el CRUD de direcciones
export interface Direction {
  id: string
  alias: string
  direction: string
  lat: number
  lng: number
}

export interface CreateDirectionRequest {
  location: string
  lat: number
  lng: number
  alias: string
  url?: string
  userId: string
}

export interface UpdateDirectionRequest {
  location: string
  lat: number
  lng: number
  alias: string
  url?: string
  locationID: string
}

export interface DirectionsResponse {
  locationData: Direction[]
  generic: {
    codeError: string
    msgError: string | null
  }
}

// Tipos de facturación
export interface BillingData {
  id: string
  userId: string
  nit: string
  razonSocial: string
  direccion: string
  createdAt?: string
  updatedAt?: string
}

export interface AddBillingRequest {
  userId: string
  nit: string
  razonSocial: string
  direccion: string
}

// Tipos de WhatsApp
export interface SendCodeRequest {
  phoneNumber: string
}

export interface VerifyCodeRequest {
  phoneNumber: string
  verificationCode: string
}

export interface WhatsAppResponse {
  codeError: string
  msgError: string
  verified?: boolean
  phoneNumber?: string
  whatsappConnected?: boolean
  serviceStatus?: string
}

// Tipos de respuesta general
export interface ApiResponse<T = any> {
  codeError: string
  msgError: string
  data?: T
}

// Tipos de error
export interface ApiError {
  message: string
  codeError?: string
  msgError?: string
  status?: number
}

