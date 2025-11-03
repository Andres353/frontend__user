// Tipos de usuario
export interface User {
  id: string
  name: string
  email: string
  phone: string
  createdAt?: string
  updatedAt?: string
  lastLocation?: string  // LocationID guardado
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

// Tipos para la API de facturación según documentación
export interface FacturaData {
  id: string
  userID: string
  razonSocial: string
  nit: string
}

export interface AddFacturaRequest {
  userID: string
  razonSocial: string
  nit: string
}

export interface EditFacturaRequest {
  id: string
  razonSocial?: string
  nit?: string
}

export interface FacturaResponse {
  codeError: string
  msgError: string
}

export interface FacturasResponse {
  facturaciones: FacturaData[]
  generic: {
    codeError: string
    msgError: string
  }
}

// Tipos de pedidos - Estructura real de la API
export interface Pedido {
  id: string
  clientName: string
  clientCode: string
  deliveryCode: string
  deliveryName: string
  creationDate: string
  urlEmpresa: string
  total: number
  status: number
  orderCode: string
  entName: string
  cel: string
  tel: string
  auxCel: string
  sizePaquete: string
  nit: string
  razonSocial: string
  location: PedidoLocation
  comments: string
  visibility: boolean
  products: PedidoProduct[]
  type: string
  entImg: string
  imgPedido: string
  chatData: PedidoChatData
  lastUpdate: string
  waitingTime: string
  inRestaurant: boolean
  paymentMethod: string
  motivo: string
  orderLit: string
  celular: string
  telefono: string
  comision: number
  fee: number
  by: string
  urlImg: string
  dateIMG: string
  urlPedido: string[]
  sosData: PedidoSosData
  kilometersData: PedidoKilometersData
}

export interface PedidoLocation {
  locationEnt: string
  latEnt: number
  lngEnt: number
  locationUser: string
  latUser: number
  lngUser: number
  initialLocationLat: number
  initialLocationLng: number
  initialLocation: string
  alias: string
}

export interface PedidoProduct {
  itemCode: string
  quantity: number
  nombre: string
  price: number
  total: number
  pvs: PedidoPvs[]
  url?: string // Campo opcional para URL de imagen del producto
}

export interface PedidoPvs {
  name: string
  pricing: PedidoPricing[]
}

export interface PedidoPricing {
  name: string
  price: number
}

export interface PedidoChatData {
  udChat: string
  readDoChatData: boolean
  readUoChatData: boolean
  dochat: string
  uochat: string
}

export interface PedidoSosData {
  deliveryCode: string
  orderid: string
  name: string
  msg: string
  lat: number
  lng: number
}

export interface PedidoKilometersData {
  distance: number
  price: number
  tiempoLimite: number
  generic: {
    codeError: string
    msgError: string
  }
}

export interface CreatePedidoRequest {
  clientCode: string
  locationId: string
  total: number
  nit: string
  phone: number  // Cambiado de vuelta a number según API docs, pero debe ser un número menor
  entcode: string
  comments: string
  paymentMethod: string
  type: string
  inRestaurant: boolean
  initialLocation: string
  products: PedidoProduct[]
}

export interface PedidosResponse {
  ordersData: Pedido[]
  comisionTotal: number
  totalPages: number
  pageNumber: number
  entereza: {
    codeError: string
    msgError: string
  }
}

export interface PedidoResponse {
  codeError: string
  msgError: string
  data?: Pedido
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

// Tipos de Empresa
export interface Empresa {
  id: string
  name: string
  description: string
  image: string
  category: string
  rating: number
  deliveryTime: string
  minOrder: number
  isOpen: boolean
  locations: EmpresaLocation[]
}

export interface EmpresaLocation {
  id: string // Este es el locationId que se envía al backend (branCode)
  branCode?: string // Código único de la sucursal
  branchId?: string // ID de MongoDB de la sucursal
  name: string
  address: string
  lat: number
  lng: number
  phone: string
  isOpen?: boolean
  deliveryTime?: string
  precio?: string
  horario?: string
  locationId?: string
}

export interface EmpresasResponse {
  codeError: string
  msgError: string
  data?: Empresa[]
}

// Tipos de Producto
export interface ProductVariablePricing {
  id: string
  name: string
  price: number
  pv: string
}

export interface ProductVariableData {
  id: string
  name: string
  canMany: boolean
  required: boolean
  instructions?: string
  quantity?: number
  pricingBean: ProductVariablePricing[]
}

export interface Producto {
  id: string
  name: string
  description: string
  price: number
  image: string | null // Permitir null para productos sin imagen
  category: string
  stock: number
  rating: number
  empresaId: string
  pv?: ProductVariableData[] // Variables del producto desde el endpoint
}

export interface ProductosResponse {
  codeError: string
  msgError: string
  data?: Producto[]
}

// Tipos de Categoría
export interface Category {
  name: string
  categoryCode: string
  url?: string
}

export interface CategoriesResponse {
  categories: Category[]
  generic: {
    codeError: string
    msgError: string
  }
}

// Tipos de Variables de Producto
export interface ProductVariable {
  id: string
  name: string
  productId: string
  required: boolean
}

export interface PricingVariable {
  id: string
  name: string
  price: number
  variableId: string
}

export interface ProductVariablesResponse {
  codeError: string
  msgError: string
  data?: ProductVariable[]
}

export interface PricingVariablesResponse {
  codeError: string
  msgError: string
  data?: PricingVariable[]
}

