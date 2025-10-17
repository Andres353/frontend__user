# Santiago Delivery Frontend

Frontend para el microservicio de usuarios de Santiago Delivery.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
# Crear archivo .env.local
VITE_API_BASE_URL=http://localhost:3002/santiago-users
VITE_WHATSAPP_SERVICE_URL=http://localhost:3001
VITE_APP_NAME=Santiago Delivery
VITE_APP_VERSION=1.0.0
```

3. **Ejecutar en desarrollo:**
```bash
npm run dev
```

4. **Abrir en el navegador:**
```
http://localhost:3000
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (Button, Input, Card, etc.)
│   ├── layout/         # Layout y navegación
│   ├── forms/          # Formularios específicos
│   └── auth/           # Componentes de autenticación
├── pages/              # Páginas principales
│   ├── auth/           # Login, registro, verificación
│   ├── profile/        # Perfil, direcciones, facturación
│   ├── admin/          # Panel de administración
│   └── Home.tsx        # Página de inicio
├── services/           # Integración con APIs
├── hooks/              # Custom hooks
├── stores/             # Estado global (Zustand)
├── types/              # Tipos TypeScript
└── utils/              # Utilidades
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🌐 APIs Integradas

### Autenticación
- `POST /login` - Iniciar sesión
- `POST /add-user` - Registrar usuario
- `GET /get-user/{id}` - Obtener usuario
- `PUT /edit-user` - Actualizar usuario

### WhatsApp
- `POST /whatsapp/send-code` - Enviar código de verificación
- `POST /whatsapp/verify-code` - Verificar código
- `GET /whatsapp/status` - Estado del servicio

### Direcciones
- `POST /add-direction` - Agregar dirección
- `GET /get-directions/{userId}` - Obtener direcciones

### Facturación
- `POST /add-facturacion` - Agregar datos de facturación

## 🎨 Componentes UI

### Button
```tsx
<Button variant="primary" size="md" isLoading={false}>
  Texto del botón
</Button>
```

### Input
```tsx
<Input
  label="Email"
  type="email"
  placeholder="tu@email.com"
  error={errors.email?.message}
/>
```

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
</Card>
```

### Modal
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Título">
  Contenido del modal
</Modal>
```

## 🔐 Autenticación

El sistema usa JWT tokens almacenados en localStorage:

```tsx
import { useAuth } from '@/hooks/useAuth'

const { user, isAuthenticated, login, logout } = useAuth()
```

## 📱 Estado Global

Usando Zustand para manejo de estado:

```tsx
import { useAuthStore } from '@/stores/authStore'

const { user, token, isAuthenticated } = useAuthStore()
```

## 🎯 Flujos Principales

### Registro de Usuario
1. Usuario completa formulario de registro
2. Sistema valida datos
3. Usuario puede verificar WhatsApp
4. Cuenta creada exitosamente

### Verificación WhatsApp
1. Usuario ingresa número de teléfono
2. Sistema envía código por WhatsApp
3. Usuario ingresa código recibido
4. Sistema verifica código

### Gestión de Perfil
1. Usuario accede a su perfil
2. Puede editar información personal
3. Puede gestionar direcciones
4. Puede configurar facturación

## 🚀 Deployment

### Build de Producción
```bash
npm run build
```

### Variables de Entorno para Producción
```bash
VITE_API_BASE_URL=https://api.santiagodelivery.com/santiago-users
VITE_WHATSAPP_SERVICE_URL=https://whatsapp.santiagodelivery.com
```

## 🧪 Testing

```bash
# Tests unitarios (cuando estén configurados)
npm run test

# Tests E2E (cuando estén configurados)
npm run test:e2e
```

## 📚 Tecnologías Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos
- **React Router** - Navegación
- **React Query** - Manejo de estado del servidor
- **Zustand** - Estado global
- **React Hook Form** - Formularios
- **React Hot Toast** - Notificaciones
- **Headless UI** - Componentes accesibles
- **Heroicons** - Iconos

## 🔧 Configuración del Backend

Asegúrate de que el backend esté ejecutándose en:
- **Puerto 3002** - Microservicio de usuarios
- **Puerto 3001** - Servicio de WhatsApp

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs del backend
2. Verificar Network Tab en DevTools
3. Consultar documentación de APIs
4. Contactar al equipo de desarrollo

## 📄 Licencia

© 2024 Santiago Delivery. Todos los derechos reservados.



