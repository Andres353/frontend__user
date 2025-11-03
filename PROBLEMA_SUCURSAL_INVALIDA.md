# ANÁLISIS TÉCNICO: ERROR "Sucursal no válida" (COD868)

## 📋 RESUMEN EJECUTIVO

El frontend está recibiendo el error **`COD868 - Sucursal no válida`** al intentar crear un pedido a través del endpoint `/order-add` de la API 3 (Pedidos MS).

## 🎯 ENDPOINTS UTILIZADOS

### Para Obtener Empresas:
- **Endpoint:** `GET /pedidos-ms/get-order?page=0&size=100`
- **Método:** `getEmpresas()`
- **Ubicación:** `src/services/api.ts` (Líneas 277-310)
- **Problema:** Extrae empresas desde pedidos antiguos, genera IDs artificiales

### Para Obtener Sucursales:
- **Endpoint:** `GET /pedidos-ms/get-order?page=0&size=100`
- **Método:** `getSucursalesByEmpresa()`
- **Ubicación:** `src/services/api.ts` (Líneas 381-431)
- **Problema:** Deriva sucursales de pedidos antiguos, usa IDs de pedidos como locationId

### Para Crear Pedido:
- **Endpoint:** `POST /pedidos-ms/order-add`
- **Método:** `createPedido()`
- **Ubicación:** `src/services/api.ts` (Líneas 437-469)
- **Problema:** Envía locationId incorrecto (ID de pedido antiguo en lugar de ID de sucursal válido)

### Configuración de APIs:
```javascript
// API 2 (Users MS) - Puerto 7000
baseURL: '/santiago-users'

// API 3 (Pedidos MS) - Puerto 4000
baseURL: '/pedidos-ms'
```

## 🔍 PROBLEMA IDENTIFICADO

### Situación Actual
El frontend envía un `locationId` que proviene de IDs de pedidos anteriores (extraídos de API 3), pero el backend de Pedidos MS espera un **ID de sucursal válido** que exista en su base de datos de sucursales.

### Código de Error
```json
{
  "codeError": "COD868",
  "msgError": "Sucursal no valida"
}
```

## 🔄 FLUJO ACTUAL (INCORRECTO)

### 1. Obtención de Empresas
**Endpoint utilizado:**
```
GET /pedidos-ms/get-order?page=0&size=100
```

**Archivo:** `src/services/api.ts` - Método `getEmpresas()` (Líneas 277-310)

**Problema:**
- Se extraen empresas desde pedidos existentes
- Se genera un ID artificial: `empresa-{nombre-empresa}`
- No hay endpoint dedicado para obtener empresas activas

**Código:**
```javascript
const response = await this.pedidosApi.get<PedidosResponse>('/get-order?page=0&size=100')
// Extrae pedido.entName y crea un ID artificial
id: `empresa-${pedido.entName.toLowerCase().replace(/\s+/g, '-')}`
```

### 2. Obtención de Sucursales
**Endpoint utilizado:**
```
GET /pedidos-ms/get-order?page=0&size=100
```

**Archivo:** `src/services/api.ts` - Método `getSucursalesByEmpresa()` (Líneas 381-431)

**Problema:**
- No existe un endpoint dedicado para obtener sucursales válidas
- El frontend deriva sucursales de pedidos existentes (incorrecto)
- El `branchCode` extraído es un ID de pedido antiguo, no un ID de sucursal válido

**Código:**
```javascript
const response = await this.pedidosApi.get<PedidosResponse>('/get-order?page=0&size=100')
const branchCode = (pedido as any).branchCode || pedido.id
// ❌ branchCode es un ID de pedido, no un ID de sucursal válido
```

**Campos extraídos de pedidos:**
- `branchCode`: ID del pedido anterior (no válido)
- `pedido.id`: ID del pedido (NO es ID de sucursal)
- `pedido.location.locationEnt`: Nombre/dirección de la sucursal

**Campos disponibles en pedidos existentes:**
- `branchCode`: ID de la sucursal (pero de un pedido anterior, no válido como referencia)
- `pedido.id`: ID del pedido (NO es el ID de sucursal)
- `pedido.location.locationEnt`: Nombre/dirección de la sucursal

### 3. Payload Enviado al Crear Pedido
```json
{
  "clientCode": "usuario_id",
  "locationId": "6567bf99b1c31a6f3b0fd9c3",  // ❌ ID incorrecto
  "total": 150.00,
  "nit": "123456789",
  "phone": 78984335,
  "entcode": "Nombre de Empresa",
  "comments": "Comentarios...",
  "paymentMethod": "efectivo",
  "type": "delivery",
  "inRestaurant": false,
  "initialLocation": "Dirección del usuario",
  "products": [...]
}
```

## 🎯 SOLUCIÓN REQUERIDA

### Opción 1: Endpoint Dedicado para Sucursales (RECOMENDADO)

**Backend debe implementar:**

```
GET /pedidos-ms/sucursales?empresaId={empresaId}
```

**Respuesta esperada:**
```json
{
  "codeError": "COD200",
  "msgError": "Sucursales obtenidas exitosamente",
  "sucursales": [
    {
      "id": "id_sucursal_valido",
      "name": "Nombre de la sucursal",
      "address": "Dirección completa",
      "lat": -17.3895,
      "lng": -66.1568,
      "phone": "+591 4 12345678",
      "empresaId": "id_empresa",
      "isActive": true
    }
  ]
}
```

### Opción 2: Validar ID en el Backend (Temporal)

Si el endpoint no se puede implementar de inmediato, el backend debe:

1. **Validar el `locationId`** antes de rechazar el pedido
2. **Retornar IDs válidos** cuando se consulta `/get-order`
3. **Proporcionar un mapeo** de sucursales válidas

## 📊 DATOS TÉCNICOS

### Estructura de Request Esperada (API 1)
Según la documentación de API 1:
- Campo: `branCode`
- Tipo: String/ObjectId de MongoDB
- Validación: Debe existir en la colección de sucursales

### Endpoints de API 1 Disponibles
```
GET /branches
```
**Respuesta:**
```json
{
  "codeError": "COD200",
  "branches": [
    {
      "id": "id_valido_sucursal",
      "name": "Sucursal Centro",
      "address": "Av. Principal #123",
      "lat": -17.3895,
      "lng": -66.1568,
      "empresaId": "id_empresa",
      "isActive": true
    }
  ]
}
```

## 🔧 IMPLEMENTACIÓN FRONTEND

### Archivo: `src/services/api.ts`

**Método actual (Líneas 381-431):**
```javascript
async getSucursalesByEmpresa(empresaId: string): Promise<{...}> {
  // Deriva sucursales de pedidos existentes
  const response = await this.pedidosApi.get<PedidosResponse>('/get-order?page=0&size=100')
  // Extrae branchCode de pedidos
  const branchCode = (pedido as any).branchCode || pedido.id
}
```

**Problema:** `branchCode` no es válido para crear nuevos pedidos

### Archivo: `src/pages/Carrito.tsx`

**Uso del locationId (Líneas 234-247):**
```javascript
const validLocationId = sucursalMasCercana?.id || null

// Validación implementada
if (!validLocationId) {
  toast.error('No se encontró una sucursal válida. Por favor, intenta de nuevo.')
  return
}

const orderData = {
  locationId: validLocationId,
  // ... otros campos
}
```

## 📝 DATOS DE PRUEBA

### IDs Probados (Inválidos)
- `6567bf99b1c31a6f3b0fd9c3` - Retorna COD868
- `68f661e1421ff02debc3728c` - Retorna COD868

### Request de Ejemplo (Swagger)
```json
{
  "clientCode": "68e9826b48fff60ed87595ba",
  "locationId": "6567bf99b1c31a6f3b0fd9c3",
  "total": 150.00,
  "nit": "123456789",
  "phone": 78984335,
  "entcode": "Nombre Empresa",
  "comments": "Pedido de prueba",
  "paymentMethod": "efectivo",
  "type": "delivery",
  "inRestaurant": false,
  "initialLocation": "Cochabamba",
  "products": [
    {
      "itemCode": "prod123",
      "quantity": 2,
      "nombre": "Producto Test",
      "price": 75.00,
      "total": 150.00,
      "pvs": []
    }
  ]
}
```

## ❓ PREGUNTAS PARA EL BACKEND

1. **¿Existe un endpoint para obtener sucursales válidas?**
   - Si no existe, ¿cuándo se implementará?
   - URL sugerida: `GET /pedidos-ms/sucursales`

2. **¿Cuál es el formato correcto del `locationId`?**
   - ¿Es un ObjectId de MongoDB?
   - ¿Hay algún prefijo especial?

3. **¿Dónde está almacenada la base de datos de sucursales?**
   - ¿API 1, API 3, o ambos?
   - ¿Hay sincronización entre APIs?

4. **¿Cómo debería el frontend obtener sucursales válidas?**
   - ¿Hay una lista de sucursales activas disponible?
   - ¿Debe filtrarse por empresa?

## 🎯 PRÓXIMOS PASOS

### Para el Backend:
1. ✅ Crear endpoint `GET /pedidos-ms/sucursales`
2. ✅ Validar `locationId` en `/order-add`
3. ✅ Retornar mensaje de error más descriptivo

### Para el Frontend:
1. ✅ Implementar `getSucursalesFromAPI1()` usando endpoint de branches
2. ✅ Usar IDs de sucursales válidas en `locationId`
3. ✅ Agregar validación antes de enviar pedido

### Estado Actual
- ⏳ Esperando respuesta del backend sobre endpoint de sucursales
- ✅ Frontend tiene validaciones implementadas
- ✅ Mensajes de error claros para el usuario

## 📞 CONTACTO

Para más información sobre este análisis, contactar al equipo de desarrollo.

---
**Fecha:** ${new Date().toLocaleDateString('es-ES')}
**Prioridad:** ALTA
**Estado:** En espera de solución backend

