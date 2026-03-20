# PantrySync - Frontend

Aplicación frontend para compartir alimentos disponibles cerca de tu ubicación.

## Descripción

PantrySync es una aplicación web que permite a los usuarios encontrar y compartir alimentos disponibles en su zona. Los usuarios pueden:

- Publicar artículos que desean compartir
- Buscar artículos cercanos según ubicación y radio
- Ver artículos en un mapa interactivo
- Gestionar su perfil de usuario

## Tecnologías

- **Angular 21** - Framework frontend
- **PrimeNG** - Biblioteca de componentes UI
- **Leaflet** - Mapas interactivos
- **TypeScript** - Lenguaje de programación
- **SCSS** - Estilos

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
```

Ejecuta la aplicación en `http://localhost:4200/`

## Build

```bash
npm run build
```

Los archivos compilados se generan en `dist/frontend/`

## Estructura del Proyecto

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts          # Protección de rutas autenticadas
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # Interceptor para token JWT
│   ├── models/
│   │   └── *.ts                   # Interfaces y tipos de datos
│   └── services/
│       ├── auth.service.ts        # Autenticación
│       ├── geolocation.service.ts # Ubicación (navegador + IP fallback)
│       ├── ip-location.service.ts # Ubicación por IP
│       └── items.service.ts      # CRUD de artículos
├── features/
│   ├── auth/
│   │   ├── login/                 # Inicio de sesión
│   │   └── register/             # Registro de usuarios
│   ├── home/                     # Mapa principal y búsqueda
│   ├── items/
│   │   ├── create/               # Crear artículo
│   │   └── list/                 # Lista de artículos del usuario
│   └── profile/                  # Perfil de usuario
└── shared/
    └── components/
        ├── change-password-dialog/    # Cambiar contraseña
        ├── create-item-dialog/        # Crear artículo (modal)
        ├── edit-item-dialog/          # Editar artículo
        ├── edit-profile-dialog/       # Editar perfil
        ├── map/                       # Componente de mapa
        ├── profile-dialog/            # Ver perfil
        └── search-dialog/             # Buscar por ubicación
```

## Funcionalidades

### Autenticación

- Registro de usuarios
- Inicio de sesión con JWT
- Cambio de contraseña
- Gestión de perfil

### Artículos

- Crear artículo con imagen, descripción, categoría y ubicación
- Editar artículos propios
- Eliminar artículos propios
- Lista de artículos del usuario

### Búsqueda

- Búsqueda por ubicación (lat/lng)
- Radio de búsqueda configurable (0.5 - 20 km)
- Geolocalización automática (navegador + fallback IP)

### Mapa

- Visualización de artículos en mapa interactivo
- Selección de ubicación al crear artículos
- Marcadores con información de artículos

## Variables de Entorno

La aplicación se conecta al backend en `http://localhost:3000/api`. Para cambiar la URL del backend, modifica los servicios en `src/app/core/services/`.

## Notas

- La geolocalización funciona mejor con HTTPS en producción
- Sin HTTPS, usa fallback por IP como alternativa
- Las imágenes se almacenan en el backend y se referencian por URL
