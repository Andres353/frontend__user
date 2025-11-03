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
  EmpresaLocation,
  DirectionsResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
  AddFacturaRequest,
  EditFacturaRequest,
  FacturaResponse,
  FacturasResponse,
  CreatePedidoRequest,
  PedidoResponse,
  PedidosResponse,
  EmpresasResponse,
  ProductosResponse,
  CategoriesResponse,
  ProductVariablesResponse,
  PricingVariablesResponse
} from '../types'

// ============================================================================
// API SERVICE PARA CLIENTES - USANDO API 2 (Users MS) Y API 3 (Pedidos MS)
// ============================================================================

class ApiService {
  private api: AxiosInstance
  private usersApi: AxiosInstance
  private pedidosApi: AxiosInstance

  constructor() {
    // API principal (proxy de Vite)
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // API de usuarios (API 2)
    this.usersApi = axios.create({
      baseURL: '/santiago-users',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // API de pedidos (API 3)
    this.pedidosApi = axios.create({
      baseURL: '/pedidos-ms',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor para agregar token
    const addToken = (config: any) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      }

    this.api.interceptors.request.use(addToken)
    this.usersApi.interceptors.request.use(addToken)
    this.pedidosApi.interceptors.request.use(addToken)

    // Response interceptor para manejar errores
    const handleError = (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message,
          status: error.response?.status,
        }

        if (error.response?.data) {
          const data = error.response.data as any
          apiError.codeError = data.codeError
          apiError.msgError = data.msgError
        }

          // Preservar el error original para debugging
          (apiError as any).__originalError = error

          console.error('API Error:', error)
        toast.error(apiError.msgError || apiError.message || 'Error de conexión')
        return Promise.reject(apiError)
      }

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      handleError
    )
    this.usersApi.interceptors.response.use(
      (response: AxiosResponse) => response,
      handleError
    )
    this.pedidosApi.interceptors.response.use(
      (response: AxiosResponse) => response,
      handleError
    )
  }

  // ============================================================================
  // MÉTODOS DE AUTENTICACIÓN (API 2 - Users MS)
  // ============================================================================

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.usersApi.post<LoginResponse>('/login', credentials)
      return response.data
    } catch (error) {
      console.error('Login API error:', error)
      throw error
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await this.usersApi.post<RegisterResponse>('/add-user', userData)
      return response.data
    } catch (error) {
      console.error('Register API error:', error)
      throw error
    }
  }

  async googleLogin(googleData: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    try {
      const response = await this.usersApi.post<GoogleLoginResponse>('/google-login', googleData)
      return response.data
    } catch (error) {
      console.error('Google login API error:', error)
      throw error
    }
  }

  async googleOperation(googleData: GoogleLoginRequest): Promise<ApiResponse> {
    try {
      const response = await this.usersApi.post<ApiResponse>('/google-operation', googleData)
      return response.data
    } catch (error) {
      console.error('Google operation API error:', error)
      throw error
    }
  }

  async getUserData(userId: string): Promise<any> {
    try {
      const response = await this.usersApi.get(`/user-data?userid=${userId}`)
      console.log('✅ User data obtenida:', response.data)
      return response.data
    } catch (error) {
      console.error('Get user data error:', error)
      throw error
    }
  }

  /**
   * Actualiza la última ubicación del usuario
   * Endpoint: PUT /santiago-users/user-last-location
   * Body: { userId, locationId }
   */
  async updateUserLastLocation(userId: string, locationId: string): Promise<ApiResponse> {
    try {
      console.log('🔍 Actualizando última ubicación del usuario:', { userId, locationId })
      const response = await this.usersApi.put<ApiResponse>('/user-last-location', {
        userId,
        locationID: locationId  // El backend espera "locationID" con mayúscula
      })
      console.log('✅ Última ubicación actualizada:', response.data)
      return response.data
    } catch (error) {
      console.error('Error updating user last location:', error)
      throw error
    }
  }

  async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.usersApi.put<ApiResponse<User>>('/edit-user', userData)
    return response.data
  }

  // ============================================================================
  // MÉTODOS DE DIRECCIONES (API 2 - Users MS)
  // ============================================================================

  async createDirection(directionData: CreateDirectionRequest): Promise<ApiResponse> {
    try {
      console.log('📤 Sending direction data to API:', JSON.stringify(directionData, null, 2))
      const response = await this.usersApi.post<ApiResponse>('/add-new-direction', directionData)
      console.log('✅ Direction created successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Create direction error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error message:', error.message)
      throw error
    }
  }

  async updateDirection(directionData: UpdateDirectionRequest): Promise<ApiResponse> {
    try {
      const response = await this.usersApi.put<ApiResponse>('/edit-direction', directionData)
      return response.data
    } catch (error) {
      console.error('Update direction error:', error)
      throw error
    }
  }

  async deleteDirection(locationID: string): Promise<ApiResponse> {
    try {
      const response = await this.usersApi.delete<ApiResponse>(`/delete-direction?id=${locationID}`)
      return response.data
    } catch (error) {
      console.error('Delete direction error:', error)
      throw error
    }
  }

  async getUserDirections(userId: string): Promise<DirectionsResponse> {
    try {
      const response = await this.usersApi.get<DirectionsResponse>(`/user-directions?userid=${userId}`)
      return response.data
    } catch (error) {
      console.error('Get directions error:', error)
      throw error
    }
  }

  // ============================================================================
  // MÉTODOS DE FACTURACIÓN (API 2 - Users MS)
  // ============================================================================

  async addFactura(facturaData: AddFacturaRequest): Promise<FacturaResponse> {
    try {
      const response = await this.usersApi.post<FacturaResponse>('/add-factura', facturaData)
        return response.data
      } catch (error) {
      console.error('Add factura error:', error)
      throw error
    }
  }

  async editFactura(facturaData: EditFacturaRequest): Promise<FacturaResponse> {
    try {
      const response = await this.usersApi.put<FacturaResponse>('/edit-factura', facturaData)
      return response.data
    } catch (error) {
      console.error('Edit factura error:', error)
      throw error
    }
  }

  async deleteFactura(facturaId: string): Promise<FacturaResponse> {
    try {
      const response = await this.usersApi.delete<FacturaResponse>(`/delete-factura?id=${facturaId}`)
      return response.data
    } catch (error) {
      console.error('Delete factura error:', error)
      throw error
    }
  }

  async getFacturas(userId: string): Promise<FacturasResponse> {
    try {
      const response = await this.usersApi.get<FacturasResponse>(`/facturaciones-user?userid=${userId}`)
      return response.data
    } catch (error) {
      console.error('Get facturas error:', error)
      throw error
    }
  }

  // ============================================================================
  // MÉTODOS DE EMPRESAS Y PRODUCTOS (API 3 - Pedidos MS)
  // ============================================================================

  /**
   * Obtiene empresas por categoría usando coordenadas del usuario
   * Endpoint: GET /santiago-companies/get-companies-category
   * Params: id (categoría), idUser, latitud, longitud
   */
  async getEmpresasByCategory(categoryId: string, idUser: string, lat: number, lng: number): Promise<any> {
    try {
      console.log('🔍 Obteniendo empresas por categoría:', categoryId)
      
      const response = await axios.get<any>('/santiago-companies/get-companies-category', {
        params: {
          id: categoryId,
          idUser: idUser,
          latitud: lat,
          longitud: lng
        }
      })
      
      console.log('✅ Empresas por categoría obtenidas:', response.data)
      
      if (response.data.companyBranchData && response.data.companyBranchData.length > 0) {
        const empresas = response.data.companyBranchData.map((item: any) => {
          const branCode = item.dataBean?.branch?.branCode || item.dataBean?.branchId
          console.log('🔍 Item completo:', JSON.stringify(item, null, 2))
          console.log('🎯 branCode extraído:', branCode)
          
          return {
            id: item.company.id,
            name: item.company.name,
            description: item.company.categoryName || item.company.name,
            image: item.company.image || item.company.imageP || null,
            category: item.company.categoryName || item.company.categoryCode || 'Empresa',
            rating: 0,
            deliveryTime: item.dataBean?.tiempo || 'No especificado',
            minOrder: 0,
            isOpen: item.dataBean?.branch?.isCurrentlyOpen || item.dataBean?.branch?.status,
            companyPrice: item.company.companyPrice,
            commission: item.company.commission,
            favorite: item.company.favorite || false,
            branCode: branCode,
            branchId: item.dataBean?.branch?.id,
            // Agregar toda la información de la sucursal
            branchData: item.dataBean?.branch
          }
        })
        
        return {
          codeError: 'COD200',
          msgError: 'Empresas obtenidas exitosamente',
          empresas: empresas
        }
      }
      
      return {
        codeError: 'COD200',
        msgError: 'No se encontraron empresas en esta categoría',
        empresas: []
      }
    } catch (error) {
      console.error('Get empresas by category error:', error)
      throw error
    }
  }

  async getEmpresas(): Promise<EmpresasResponse> {
    try {
      // Intentar primero con la nueva API de empresas (puerto 4010)
      try {
        const response = await axios.get<any>('/santiago-companies/get-companies')
        
        if (response.data.companies && response.data.companies.length > 0) {
          // Transformar datos de la nueva API al formato esperado
          const empresas = response.data.companies.map((company: any) => ({
            id: company.id,
            name: company.name,
            description: company.categoryName || company.name,
            image: company.image || company.imageP || null,
            category: company.categoryName || company.categoryCode || 'Empresa',
            rating: 0,
            deliveryTime: 'No especificado',
            minOrder: 0,
            isOpen: company.status === 'active' || company.status === 'activa',
            companyPrice: company.companyPrice,
            commission: company.commission
          }))
          
          return {
            codeError: 'COD200',
            msgError: 'Empresas obtenidas exitosamente',
            data: empresas
          }
        }
      } catch (companiesApiError) {
        console.log('⚠️ Companies API failed, using fallback...')
      }
      
      // Fallback: Obtener empresas desde los pedidos existentes
      const response = await this.pedidosApi.get<PedidosResponse>('/get-order?page=0&size=100')
      
      if (response.data.ordersData && response.data.ordersData.length > 0) {
      // Extraer empresas únicas de los pedidos
            const empresasMap = new Map()
        
        response.data.ordersData.forEach(pedido => {
          if (pedido.entName && pedido.entName.trim() !== '') {
              if (!empresasMap.has(pedido.entName)) {
                empresasMap.set(pedido.entName, {
                  id: `empresa-${pedido.entName.toLowerCase().replace(/\s+/g, '-')}`,
              name: pedido.entName,
                  description: `Empresa ${pedido.entName}`,
                image: pedido.entImg || null,
                  category: 'Empresa',
                rating: 0,
                deliveryTime: 'No especificado',
                minOrder: 0,
              isOpen: true,
                  locations: [
                    {
                    id: pedido.id || `location-${pedido.entName.toLowerCase().replace(/\s+/g, '-')}`,
                      name: pedido.location?.locationEnt || 'Ubicación no especificada',
                      address: pedido.location?.locationEnt || 'Dirección no especificada',
                    lat: pedido.location?.latEnt || 0,
                    lng: pedido.location?.lngEnt || 0,
                    phone: pedido.cel || 'No especificado'
                    }
                  ]
            })
          }
        }
      })
      
      const empresas = Array.from(empresasMap.values())
              return {
          codeError: 'COD200',
          msgError: 'Empresas obtenidas exitosamente',
          data: empresas
        }
      }
      
      return {
          codeError: 'COD200',
        msgError: 'No se encontraron empresas',
          data: []
        }
    } catch (error) {
      console.error('Get empresas error:', error)
      throw error
    }
  }

  async getCategories(): Promise<CategoriesResponse> {
    try {
      const response = await axios.get<CategoriesResponse>('/santiago-categories/get-category')
      return response.data
    } catch (error) {
      console.error('Get categories error:', error)
      throw error
    }
  }

  async getProductosByEmpresa(empresaId: string): Promise<ProductosResponse> {
    try {
      // Obtener productos desde los pedidos de la empresa específica
      const response = await this.pedidosApi.get<PedidosResponse>('/get-order?page=0&size=100')
      
      if (response.data.ordersData && response.data.ordersData.length > 0) {
        const empresaName = empresaId.replace('empresa-', '').replace(/-/g, ' ')
              const productosMap = new Map()
        
        response.data.ordersData.forEach(pedido => {
          if (pedido.entName && pedido.entName.toLowerCase() === empresaName.toLowerCase()) {
                  pedido.products?.forEach(producto => {
                    if (producto.nombre && !productosMap.has(producto.itemCode)) {
                      productosMap.set(producto.itemCode, {
                        id: producto.itemCode,
                        name: producto.nombre,
                        description: `Producto de ${pedido.entName}`,
                        price: producto.price,
                  image: producto.url || null,
                  category: 'Producto', // Categoría simple por defecto
                  stock: 0,
                  rating: 0,
                  empresaId: empresaId
                })
            }
          })
        }
      })
      
      const productos = Array.from(productosMap.values())
        return {
          codeError: 'COD200',
          msgError: 'Productos obtenidos exitosamente',
          data: productos
        }
      }
      
        return {
          codeError: 'COD200',
        msgError: 'No se encontraron productos',
          data: []
        }
    } catch (error) {
      console.error('Get productos error:', error)
      throw error
    }
  }

  /**
   * Obtiene las sucursales de una empresa
   * Endpoint: GET /santiago-companies/get-branches?companyid=xxx
   */
  async getSucursalesByEmpresa(empresaId: string, userLat?: number, userLng?: number): Promise<{ codeError: string; msgError: string; sucursales: EmpresaLocation[] }> {
    try {
      // Coordenadas por defecto (Cochabamba)
      const defaultLat = -17.3895
      const defaultLng = -66.1568
      
      // Usar las coordenadas del usuario si están disponibles, sino usar coordenadas por defecto
      const lat = userLat || defaultLat
      const lng = userLng || defaultLng
      
      // Intentar con el endpoint get-branches-search que devuelve branCode (usa proxy de Vite)
      try {
        const empresasParam = {
          id: empresaId,
          latitud: lat,
          longitud: lng,
          tipo: 0,
          regex: '',
          page: 0,
          size: 100
        }
        // Llamar usando el proxy de Vite que redirige al puerto 4010
        // El endpoint espera el parámetro "empresas" como query string
        const response = await axios.get<any>('/santiago-branches/get-branches-search', {
          params: {
            empresas: empresasParam
          }
        })
        
        if (response.data.content && response.data.content.length > 0) {
          const sucursales = response.data.content.map((item: any) => {
            // El branCode está dentro de branch.branch.branCode
            const branCode = item.branch?.branch?.branCode || item.branch?.branCode || item.branch?.branch?.id || item.branch?.id || item.id
            
            return {
              id: branCode, // USAR BRANCODE COMO LOCATIONID
              branCode: branCode,
              branchId: item.branch?.branch?.id,
              name: item.branch?.branch?.sectorName || item.branch?.name || 'Sucursal',
              address: item.branch?.branch?.sectorName || item.branch?.name || 'Dirección no especificada',
              lat: item.branch?.branch?.lat || defaultLat,
              lng: item.branch?.branch?.long || item.branch?.branch?.lng || defaultLng,
              phone: item.branch?.branch?.wpp || item.branch?.branch?.tel || '+591 4 0000000',
              isOpen: item.branch?.branch?.isCurrentlyOpen !== undefined ? item.branch.branch.isCurrentlyOpen : item.branch?.status,
              deliveryTime: item.branch?.tiempo || item.branch?.branch?.deliveryTime || 'No especificado',
              precio: item.branch?.price || '0',
              horario: ''
            }
          })
          
          console.log(`✅ Sucursales obtenidas con branCode: ${sucursales.length}`)
          return {
            codeError: 'COD200',
            msgError: 'Sucursales obtenidas exitosamente',
            sucursales: sucursales
          }
        }
      } catch (branchesError) {
        // fallback a get-branches
      }
      
      // Fallback: usar get-branches normal
      try {
        const response = await axios.get<any>('/santiago-companies/get-branches', {
          params: { companyid: empresaId }
        })
        
        if (response.data.branches && response.data.branches.length > 0) {
          // Intentar obtener branCode del endpoint get-branch-data
          const sucursales = await Promise.all(
            response.data.branches.map(async (branch: any) => {
              let branCode = branch.branCode
              
              // Intentar obtener branCode del endpoint get-branch-data
              if (!branCode && branch.id) {
                try {
                  const branchDataResponse = await axios.get<any>('/santiago-companies/get-branch-data', {
                    params: { id: branch.id }
                  })
                  
                  if (branchDataResponse.data.branches && branchDataResponse.data.branches.length > 0) {
                    const branchData = branchDataResponse.data.branches[0]
                    // Intentar obtener branCode de varios posibles campos
                    branCode = branchData.branCode || branchData.branch?.branCode || branchData.id
                  }
                } catch (error) {
                  // ignorar
                }
              }
              
              const locationId = branCode || branch.id // Preferir branCode
              
              return {
                id: locationId, // USAR branCode COMO locationId
                branCode: branCode,
                branchId: branch.id,
                name: branch.sectorName || branch.name || 'Sucursal',
                address: branch.location?.locationEnt || branch.sectorName || 'Dirección no especificada',
                lat: branch.lat || defaultLat,
                lng: branch.lng || defaultLng,
                phone: branch.wpp || branch.tel || '+591 4 0000000',
                isOpen: branch.isCurrentlyOpen !== undefined ? branch.isCurrentlyOpen : branch.status,
                deliveryTime: branch.tiempo || branch.deliveryTime || 'No especificado',
                precio: branch.precio || '0',
                horario: branch.horario || ''
              }
            })
          )
          
          return {
            codeError: 'COD200',
            msgError: 'Sucursales obtenidas exitosamente',
            sucursales: sucursales
          }
        }
      } catch (branchesError) {
        // fallback a pedidos
      }
      
      // Fallback: obtener sucursales desde pedidos (mantener compatibilidad)
      const response = await this.pedidosApi.get<PedidosResponse>('/get-order?page=0&size=100')
      
      if (response.data.ordersData && response.data.ordersData.length > 0) {
        const empresaName = empresaId.replace('empresa-', '').replace(/-/g, ' ')
        const sucursalesMap = new Map()

        response.data.ordersData.forEach(pedido => {
          if (pedido.entName && pedido.entName.toLowerCase() === empresaName.toLowerCase()) {
          if (pedido.location && pedido.location.locationEnt) {
              // Log para ver la estructura completa del pedido
              console.log('📋 Pedido completo:', JSON.stringify(pedido, null, 2))
              const branchCode = (pedido as any).branchCode || pedido.id
              console.log('🔍 branchCode encontrado:', branchCode)
              
              if (branchCode && !sucursalesMap.has(branchCode)) {
                sucursalesMap.set(branchCode, {
                  id: branchCode,
                  name: pedido.location.locationEnt,
                  address: pedido.location.locationEnt,
                  lat: pedido.location.latEnt || -17.3895,
                  lng: pedido.location.lngEnt || -66.1568,
                  phone: pedido.cel || '+591 4 0000000',
                  locationId: pedido.id
                })
              }
            }
          }
        })

        const sucursales = Array.from(sucursalesMap.values())
        console.log('📍 Sucursales encontradas:', sucursales.length)
        return {
          codeError: 'COD200',
          msgError: 'Sucursales obtenidas exitosamente',
          sucursales: sucursales
        }
      }
      
      return {
        codeError: 'COD200',
        msgError: 'No se encontraron sucursales',
          sucursales: []
      }
    } catch (error) {
      console.error('Get sucursales error:', error)
      throw error
    }
  }

  // ============================================================================
  // MÉTODOS DE PEDIDOS (API 3 - Pedidos MS)
  // ============================================================================

  async createPedido(pedidoData: CreatePedidoRequest): Promise<PedidoResponse> {
    try {
      console.log('📤 Creating pedido:', JSON.stringify(pedidoData, null, 2))
      console.log('📤 Endpoint: /pedidos-ms/order-add')
      console.log('📤 Request method: POST')
      
      // Usar directamente el endpoint de pedidos-ms
      const response = await this.pedidosApi.post<PedidoResponse>('/order-add', pedidoData)
      
      console.log('✅ Create pedido response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Create pedido error:', error)
      
      // Acceder al error original de axios si está disponible
      const originalError = error.__originalError
      if (originalError?.response) {
        console.error('❌ Original error response data:', originalError.response.data)
        console.error('❌ Original error response status:', originalError.response.status)
        console.error('❌ Original error response headers:', originalError.response.headers)
      }
      if (originalError?.request) {
        console.error('❌ Original error request:', originalError.request)
      }
      
      // El error ya fue transformado por el interceptor
      console.error('❌ Transformed error:', {
        message: error.message,
        status: error.status,
        codeError: error.codeError,
        msgError: error.msgError
      })
      
      throw error
    }
  }

  async getPedidos(page: number = 0, size: number = 10): Promise<PedidosResponse> {
    try {
      const response = await this.pedidosApi.get<PedidosResponse>(`/get-order?page=${page}&size=${size}`)
      return response.data
    } catch (error) {
      console.error('Get pedidos error:', error)
      throw error
    }
  }

  async getPedidosByUser(userId: string, page: number = 0, size: number = 10): Promise<PedidosResponse> {
    try {
      const response = await this.pedidosApi.get<PedidosResponse>(`/get-order-user?userID=${userId}&page=${page}&size=${size}`)
      return response.data
    } catch (error) {
      console.error('Get pedidos by user error:', error)
      throw error
    }
  }

  async getPedido(pedidoId: string): Promise<PedidoResponse> {
    try {
      const response = await this.pedidosApi.get<PedidoResponse>(`/get-order/${pedidoId}`)
      return response.data
    } catch (error) {
      console.error('Get pedido error:', error)
      throw error
    }
  }

  async updatePedido(pedidoId: string, pedidoData: Partial<CreatePedidoRequest>): Promise<PedidoResponse> {
    try {
      const response = await this.pedidosApi.put<PedidoResponse>(`/order-update/${pedidoId}`, pedidoData)
      return response.data
    } catch (error) {
      console.error('Update pedido error:', error)
      throw error
    }
  }

  // ============================================================================
  // MÉTODOS LEGACY (MANTENER COMPATIBILIDAD)
  // ============================================================================

  async addAddress(addressData: AddAddressRequest): Promise<ApiResponse<Address>> {
    return this.createDirection(addressData as any)
  }

  async getAddresses(userId: string): Promise<ApiResponse<Address[]>> {
    const response = await this.getUserDirections(userId)
    return {
      codeError: response.generic?.codeError || 'COD200',
      msgError: response.generic?.msgError || 'Success',
      data: (response.locationData || []).map((dir: any) => ({
        id: dir.id,
        userId: userId,
        address: dir.direction,
        city: 'Cochabamba',
        coordinates: {
          latitude: dir.lat,
          longitude: dir.lng
        }
      }))
    }
  }

  async addBilling(billingData: AddBillingRequest): Promise<ApiResponse<BillingData>> {
    return this.addFactura(billingData as any)
  }

  async uploadImage(userId: string, imageFile: File): Promise<FacturaResponse> {
    const formData = new FormData()
    formData.append('id', userId)
    formData.append('img', imageFile)
    
    const response = await this.usersApi.post<FacturaResponse>('/img', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

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

  // Método para obtener categorías únicas de productos de una empresa específica
  async getProductCategoriesByEmpresa(empresaId: string): Promise<string[]> {
    try {
      const productosResponse = await this.getProductosByEmpresa(empresaId)
      if (productosResponse.data) {
        const categories = Array.from(new Set(productosResponse.data.map(p => p.category)))
        return categories.filter(cat => cat !== 'Producto') // Filtrar categoría por defecto
      }
      return []
    } catch (error) {
      console.error('Get product categories by empresa error:', error)
      return []
    }
  }

  /**
   * Obtiene sucursal más cercana según coordenadas
   * Endpoint: GET /santiago-companies/get-branches-nearest?companyid=xxx&lat=xxx&lng=xxx
   */
  async getSucursalMasCercana(empresaId: string, lat: number, lng: number): Promise<EmpresaLocation | null> {
    try {
      console.log('🔍 Obteniendo sucursal más cercana para empresa:', empresaId)
      
      const response = await axios.get<any>('/santiago-companies/get-branches-nearest', {
        params: { 
          companyid: empresaId,
          lat: lat,
          lng: lng
        }
      })
      
      console.log('✅ Respuesta de sucursal más cercana:', response.data)
      
      if (response.data.branches) {
        const branch = response.data.branches
        return {
          id: branch.id,
          name: branch.sectorName || 'Sucursal',
          address: branch.sectorName || 'Dirección no especificada',
          lat: branch.lat || lat,
          lng: branch.lng || lng,
          phone: branch.wpp || branch.tel || '+591 4 0000000'
        }
      }
      
      return null
    } catch (error) {
      console.error('Get sucursal más cercana error:', error)
      return null
    }
  }

  /**
   * Obtiene datos completos de una empresa (categorías y productos)
   * Endpoint: GET /santiago-companies/get-data-search?idUser=xxx
   * Retorna: companies, categoriesData, productsUser
   */
  async getEmpresaDataCompleta(idUser: string): Promise<any> {
    try {
      console.log('🔍 Obteniendo datos completos de empresa para usuario:', idUser)
      
      const response = await axios.get<any>('/santiago-companies/get-data-search', {
        params: { idUser }
      })
      
      console.log('✅ Datos completos obtenidos:', response.data)
      return response.data
    } catch (error) {
      console.error('Get empresa data completa error:', error)
      throw error
    }
  }

  /**
   * Obtiene categorías y productos de una sucursal específica
   * Usa el endpoint de categorías que ya está implementado en EmpresaProductos
   * Endpoint: GET /santiago-catprod/get-category-products-data?id=sucursalId&idUser=xxx
   */
  async getCategoriasBySucursal(sucursalId: string, idUser: string): Promise<any> {
    try {
      console.log('🔍 Obteniendo categorías para sucursal:', sucursalId)
      
      const response = await axios.get<any>('/santiago-catprod/get-category-products-data', {
        params: {
          id: sucursalId,
          idUser: idUser
        }
      })
      
      console.log('✅ Categorías obtenidas:', response.data)
      return response.data
    } catch (error) {
      console.error('Get categorías by sucursal error:', error)
      throw error
    }
  }

  /**
   * Obtiene variables de un producto
   * Endpoint: GET /santiago-pv/get-pv-product
   * Params: id (ID del producto)
   */
  async getProductVariables(productId: string): Promise<ProductVariablesResponse> {
    try {
      console.log('🔍 Obteniendo variables para producto:', productId)
      
      const response = await axios.get<any>('/santiago-pv/get-pv-product', {
        params: { id: productId }
      })
      
      console.log('✅ Variables de producto obtenidas:', response.data)
      
      // La respuesta tiene el formato: { pv: [...], generic: {...} }
      const pvData = response.data.pv || []
      
      return {
        codeError: response.data.generic?.codeError || 'COD200',
        msgError: response.data.generic?.msgError || 'Variables obtenidas exitosamente',
        data: pvData
      }
    } catch (error: any) {
      // Si el endpoint no existe o devuelve 404, asumir que no hay variables
      if (error.response?.status === 404 || error.response?.status === 400) {
        // No registrar error, es normal que algunos productos no tengan variables
        return {
          codeError: 'COD200',
          msgError: 'Producto sin variables',
          data: []
        }
      }
      console.error('Get product variables error:', error)
      // En caso de otros errores, retornar sin variables
      return {
        codeError: 'COD200',
        msgError: 'Producto sin variables',
        data: []
      }
    }
  }

  /**
   * Obtiene precios de variables de un producto
   * Endpoint: GET /santiago-pricing/get-pv-product
   * Params: id (ID del producto)
   */
  async getPricingByProduct(productId: string): Promise<PricingVariablesResponse> {
    try {
      console.log('🔍 Obteniendo precios de variables para producto:', productId)
      
      const response = await axios.get<any>('/santiago-pricing/get-pv-product', {
        params: { id: productId }
      })
      
      console.log('✅ Precios de variables obtenidos:', response.data)
      
      // La respuesta tiene el formato: { pricingData: [...], generic: {...} }
      const pricingData = response.data.pricingData || []
      
      return {
        codeError: response.data.generic?.codeError || 'COD200',
        msgError: response.data.generic?.msgError || 'Precios obtenidos exitosamente',
        data: pricingData
      }
    } catch (error: any) {
      console.error('Get pricing by product error:', error)
      // Retornar sin error para que continúe el flujo
      return {
        codeError: 'COD200',
        msgError: 'Sin precios de variables',
        data: []
      }
    }
  }

  /**
   * Obtiene variables y precios de un producto
   * Combina llamadas a get-pv-product y get-pv-product pricing
   */
  async getProductVariablesWithPricing(productId: string): Promise<any> {
    try {
      console.log('🔍 Obteniendo variables y precios para producto:', productId)
      
      // Obtener variables del producto
      const variablesResponse = await this.getProductVariables(productId)
      
      if (!variablesResponse.data || variablesResponse.data.length === 0) {
        return {
          codeError: 'COD200',
          msgError: 'Producto sin variables',
          variables: []
        }
      }

      // Obtener todos los precios del producto de una vez
      const pricingResponse = await this.getPricingByProduct(productId)
      const allPricing = pricingResponse.data || []
      
      // Combinar variables con sus precios correspondientes
      // El pricingData tiene un campo "pv" que es el ID de la variable
      const variablesWithPricing = variablesResponse.data.map((variable) => {
        const pricingForVariable = allPricing.filter((pricing: any) => pricing.pv === variable.id)
        
        // Convertir el formato de pricing al formato esperado por el modal
        const formattedPricing = pricingForVariable.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          variableId: p.pv
        }))
        
        return {
          ...variable,
          pricing: formattedPricing
        }
      })
      
      console.log('✅ Variables con precios obtenidas:', variablesWithPricing)
      
      return {
        codeError: 'COD200',
        msgError: 'Variables y precios obtenidos exitosamente',
        variables: variablesWithPricing
      }
    } catch (error) {
      console.error('Get product variables with pricing error:', error)
      // En caso de error, retornar sin variables
      return {
        codeError: 'COD200',
        msgError: 'Producto sin variables',
        variables: []
      }
    }
  }
}

// Crear instancia de forma lazy
let apiServiceInstance: ApiService | null = null

export const apiService = (): ApiService => {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService()
  }
  return apiServiceInstance
}

export default apiService