# ANÁLISIS: Problema con COD868 - Sucursal no válida

## 🎯 PROBLEMA ACTUAL

El frontend está recibiendo el error **`COD868 - Sucursal no válida`** al intentar crear un pedido.

### Lo que está pasando:
1. ✅ Frontend llama a `/santiago-companies/get-branches` con `companyid=66bccdb255f2175c6d95bdab`
2. ✅ El endpoint retorna la sucursal con `id: "66bccec655f2175c6d95bdac"`
3. ✅ Frontend envía ese ID como `locationId` a `/pedidos-ms/order-add`
4. ❌ Backend responde: `COD868 - Sucursal no válida`

### Por qué falla:
El endpoint `/pedidos-ms/order-add` está validando que el `locationId` existe en su base de datos de sucursales, pero el ID que viene de `/santiago-companies/get-branches` no existe en la base de datos de Pedidos MS.

## 🔍 DATOS ENVIADOS AL BACKEND

```json
{
  "clientCode": "68e9826b48fff60ed87595ba",
  "locationId": "66bccec655f2175c6d95bdac",  ← ESTE ES EL ID DE LA SUCURSAL
  "total": 16,
  "nit": "",
  "phone": 178984335,
  "entcode": "Castores Salteñería",
  "comments": "Pedido de Castores Salteñería",
  "paymentMethod": "efectivo",
  "type": "delivery",
  "inRestaurant": false,
  "initialLocation": "Av ramon rivero cines",
  "products": [
    {
      "itemCode": "66bcd14f55f2175c6d95bdb2",
      "quantity": 1,
      "nombre": "SALTEÑA+CAFE AMERICANO",
      "price": 16,
      "total": 16,
      "pvs": []
    }
  ]
}
```

## 📋 LO QUE DICE EL ENDPOINT QUE DEBERÍA USARSE

Según la documentación del Swagger, existe el endpoint:

**`GET /santiago-branches/get-branches-search`**

Este endpoint recibe un objeto `empresas` y retorna datos que incluyen:
```json
{
  "content": [
    {
      "branch": {
        "branch": {
          "branCode": "string"  ← ESTE ES EL CAMPO QUE NECESITAMOS
        }
      }
    }
  ]
}
```

### El problema con este endpoint:
- ❌ Da error 500 al enviar cualquier formato de parámetros
- ❌ Probamos `empresas[id]`, `empresas.latitud`, etc. → 500
- ❌ Probamos enviar `empresas` como JSON string → 500
- ❌ Probamos enviar parámetros planos `id`, `latitud`, etc. → 500

## ✅ SOLUCIONES POSIBLES

### Opción 1: Arreglar el endpoint `/santiago-branches/get-branches-search`
- Aceptar correctamente los parámetros del objeto `empresas`
- Retornar el `branCode` correctamente
- Frontend ya está preparado para usar ese `branCode`

### Opción 2: Modificar `/pedidos-ms/order-add` para aceptar IDs de `/santiago-companies/get-branches`
- El backend necesita sincronizar IDs entre Companies MS y Pedidos MS
- O aceptar IDs de Companies MS como válidos

### Opción 3: Que `/santiago-companies/get-branches` incluya el `branCode`
- Modificar ese endpoint para que retorne el `branCode` de cada sucursal
- Frontend ya está preparado para usar ese campo si existe

## 🎯 QUÉ HACE EL FRONTEND ACTUALMENTE

### 1. Intenta obtener sucursales con `branCode`:
```typescript
// Intenta llamar a /santiago-branches/get-branches-search
try {
  const response = await axios.get('/santiago-branches/get-branches-search', {
    params: { empresas: JSON.stringify({ id, latitud, longitud, ... }) }
  })
  // Extrae branCode si existe
  const branCode = response.data.content[0].branch.branch.branCode
} catch (error) {
  // Si falla, usa fallback
}
```

### 2. Usa fallback `/santiago-companies/get-branches`:
```typescript
// Si el endpoint anterior falla (siempre da 500), usa este
const response = await axios.get('/santiago-companies/get-branches', {
  params: { companyid: empresaId }
})
// Retorna el ID de la sucursal
const id = response.data.branches[0].id
```

### 3. Envía el pedido con el ID que tiene:
```typescript
const orderData = {
  locationId: validLocationId, // Este es el ID de /get-branches
  // ...
}
```

## 🔧 ACCIÓN REQUERIDA EN EL BACKEND

**URGENTE:** El endpoint `/santiago-companies/get-branches` necesita:
1. ✅ Incluir el campo `branCode` en el `BranchBean`
2. ✅ El campo ya existe en la base de datos, solo falta retornarlo en la respuesta

### Archivo a modificar en el backend Java:
**`BranchBean.java`** - Agregar el campo `branCode`

```java
public class BranchBean {
  private String id;
  private String branCode;  // ← AGREGAR ESTE CAMPO Y SU GETTER/SETTER
  private String sectorName;
  private String wpp;
  private String tel;
  // ... resto de campos
}
```

### Archivo a modificar en el controller:
**`CompaniesController.java`** - Asegurar que se mapee el `branCode`:

```java
@GetMapping("/get-branches")
public ResponseEntity<?> getBranches(@RequestParam String companyid) {
  List<BranchesCollection> branches = ... // obtener de BD
  
  List<BranchBean> beanList = branches.stream().map(branch -> {
    BranchBean bean = new BranchBean();
    bean.setId(branch.getId());
    bean.setBranCode(branch.getBranCode());  // ← MAPEAR ESTE CAMPO
    bean.setSectorName(branch.getSectorName());
    // ... resto de campos
    return bean;
  }).collect(Collectors.toList());
  
  return ResponseEntity.ok(beanList);
}
```

## 📊 LOGS DEL ERROR

```
🔍 Sucursal completa: {
  "id": "66bccec655f2175c6d95bdac",  ← Este ID
  "branchId": "66bccec655f2175c6d95bdac",
  "name": "Av. Aniceto Arce Nro 517 ",
  "address": "Av. Aniceto Arce Nro 517 ",
  ...
}

📤 Creating pedido: {
  "locationId": "66bccec655f2175c6d95bdac",  ← Se envía este ID
  ...
}

✅ Create pedido response: {codeError: 'COD868', msgError: 'Sucursal no valida'}  ← Backend lo rechaza
```

## ❓ PREGUNTA PARA EL BACKEND

¿Qué valor espera el endpoint `/pedidos-ms/order-add` en el campo `locationId`?

- ¿Es un `branCode` específico que solo está en la base de datos de Pedidos MS?
- ¿Es el ID de MongoDB de la sucursal?
- ¿Hay una tabla de mapeo entre IDs de Companies MS y sucursales en Pedidos MS?

**NEcesito esta información para poder crear pedidos correctamente.**

