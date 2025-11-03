# 🔧 Configuración de Google OAuth

## ❌ Error Actual
```
The given origin is not allowed for the given client ID
```

## ✅ Solución

### 1. Ir a Google Cloud Console
- Ve a [Google Cloud Console](https://console.cloud.google.com/)
- Selecciona tu proyecto
- Ve a **APIs & Services** → **Credentials**

### 2. Encontrar tu OAuth Client ID
- Busca: `867478989787-6h0re6ipld94akr6jif2vsrn6ngq6ffc.apps.googleusercontent.com`
- Haz clic en el ícono de editar (✏️)

### 3. Agregar URLs Autorizadas

#### **Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
http://127.0.0.1:5173
```

#### **Authorized redirect URIs:**
```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
http://127.0.0.1:5173
```

### 4. Guardar Cambios
- Haz clic en **"Save"**
- Los cambios pueden tardar unos minutos en aplicarse

### 5. Probar
- Recarga la página de registro
- El botón de Google debería funcionar correctamente

## 🚀 URLs de Producción
Cuando despliegues a producción, agrega también:
```
https://tu-dominio.com
https://www.tu-dominio.com
```

## 🔍 Verificación
Si el error persiste:
1. Verifica que las URLs estén exactamente como aparecen en la consola del navegador
2. Espera 5-10 minutos para que los cambios se propaguen
3. Limpia la caché del navegador (Ctrl+F5)
4. Verifica que el Client ID sea correcto

## 📞 Soporte
Si necesitas ayuda adicional, contacta al administrador del proyecto.
