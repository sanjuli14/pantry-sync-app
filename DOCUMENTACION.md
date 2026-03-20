# Pantry-Sync Backend Documentation

## 1. Descripción General

Pantry-Sync es una API REST que permite a usuarios compartir alimentos que están por vencer con personas cercanas. Los usuarios pueden registrar items de comida con ubicación GPS para que otros usuarios puedan encontrarlos facilmente.

---

## 2. Estructura del Proyecto

```
backend/
├── main.py              # Punto de entrada FastAPI
├── models.py            # Modelos de base de datos SQLAlchemy
├── schemas.py           # Esquemas Pydantic para validación
├── database.py          # Configuración de la base de datos
├── auth.py              # Utilidades de autenticación JWT
├── requirements.txt     # Dependencias Python
├── Dockerfile           # Definición de contenedor Docker
├── docker-compose.yml   # Orquestación Docker
├── .env                 # Variables de entorno
├── .env.example         # Plantilla de variables
├── pantry.db            # Base de datos SQLite
└── uploads/             # Imágenes de items
```

---

## 3. Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| Framework | FastAPI |
| ORM | SQLAlchemy |
| Base de datos | SQLite (configurable) |
| Validación | Pydantic |
| Auth | JWT (python-jose) + BCrypt |
| Servidor | Uvicorn |
| Lenguaje | Python 3.11+ |

---

## 4. Modelos de Datos

### 4.1 User (Usuario)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | ID único (PK) |
| `alias` | String | Nombre de usuario (3-30 chars, único) |
| `phone` | String | Teléfono (8-20 chars, único) |
| `hashed_password` | String | Contraseña hasheada con BCrypt |
| `created_at` | DateTime | Fecha de creación |

### 4.2 Item (Artículo)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | ID único (PK) |
| `title` | String | Nombre del artículo |
| `description` | String | Descripción detallada |
| `zone` | String | Zona geográfica |
| `category` | String | Categoría del producto |
| `contact` | String | Información de contacto |
| `image_url` | String | Ruta de imagen (nullable) |
| `latitude` | Float | Latitud GPS (-90 a 90) |
| `longitude` | Float | Longitud GPS (-180 a 180) |
| `user_id` | Integer | ID del dueño (FK) |
| `created_at` | DateTime | Fecha de creación |
| `expires_at` | DateTime | Fecha de expiración |

**Relación:** Item pertenece a User (muchos-a-uno)

### 4.3 Expiración por Categoría

| Categoría | Horas hasta expirar |
|-----------|---------------------|
| Frutas/Vegetales | 48 |
| Panadería | 24 |
| Lácteos | 72 |
| Enlatados | 720 |
| Higiene | 2160 |
| Otros | 48 |

---

## 5. Endpoints

### 5.1 Autenticación (`/auth`)

#### POST /auth/register
Registrar un nuevo usuario.

**Body:**
```json
{
  "alias": "string (3-30 chars)",
  "phone": "string (8-20 chars)",
  "password": "string (min 4 chars)"
}
```

**Response (201):**
```json
{
  "id": 1,
  "alias": "john_doe",
  "phone": "+1234567890",
  "created_at": "2024-01-15T10:30:00"
}
```

---

#### POST /auth/login
Iniciar sesión y obtener token JWT.

**Body (OAuth2 Form):**
- `username`: alias del usuario
- `password`: contraseña

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

---

#### GET /auth/me
Obtener perfil del usuario autenticado.

**Auth:** Bearer Token

**Response (200):**
```json
{
  "id": 1,
  "alias": "john_doe",
  "phone": "+1234567890",
  "created_at": "2024-01-15T10:30:00"
}
```

---

### 5.2 Artículos (`/items`)

#### POST /items/
Crear un nuevo artículo.

**Auth:** Bearer Token

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "zone": "string",
  "category": "string",
  "contact": "string",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (201):**
```json
{
  "id": 1,
  "title": "Manzanas frescas",
  "description": "Manzanas rojas",
  "zone": "Centro",
  "category": "Frutas/Vegetales",
  "contact": "+1234567890",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "image_url": null,
  "user_id": 1,
  "created_at": "2024-01-15T10:30:00",
  "expires_at": "2024-01-17T10:30:00"
}
```

---

#### GET /items/
Listar todos los artículos activos (no expirados).

**Response (200):** Array de ItemResponse

---

#### GET /items/nearby
Buscar artículos cercanos por GPS.

**Query Parameters:**
- `lat` (requerido): Latitud
- `lng` (requerido): Longitud
- `radius` (opcional): Radio en km (default: 0.5, max: 10)

**Response (200):**
```json
[
  {
    "item": { /* ItemResponse */ },
    "distance_km": 0.35
  }
]
```

---

#### GET /items/mine
Obtener artículos del usuario autenticado.

**Auth:** Bearer Token

**Response (200):** Array de ItemResponse

---

#### GET /items/zone/{zone}
Filtrar artículos por zona.

**Response (200):** Array de ItemResponse

---

#### POST /items/{item_id}/image
Subir imagen para un artículo.

**Auth:** Bearer Token

**Body:** Multipart form con archivo de imagen

**Formatos permitidos:** JPEG, PNG, WebP

**Response (200):**
```json
{
  "image_url": "/uploads/abc123.jpg",
  "item_id": 1
}
```

---

#### DELETE /items/{item_id}
Eliminar un artículo (solo el dueño).

**Auth:** Bearer Token

**Response (200):**
```json
{
  "message": "Item eliminado"
}
```

---

#### DELETE /items/system/cleanup
Eliminar artículos expirados del sistema.

**Response (200):**
```json
{
  "message": "Se eliminaron 5 productos expirados."
}
```

---

### 5.3 Otros Endpoints

#### GET /
Verificar estado de la API.

**Response (200):**
```json
{
  "status": "Pantry-Sync Online",
  "version": "1.0.0"
}
```

---

## 6. Autenticación

- **Método:** JWT con OAuth2 Password Flow
- **Algoritmo:** HS256
- **Expiración:** 24 horas
- **Header:** `Authorization: Bearer <token>`
- **Encriptación:** BCrypt para contraseñas

---

## 7. Configuración de Producción (Docker)

```yaml
# docker-compose.yml
services:
  pantry_prod:
    build: .
    ports:
      - "80:8000"
    volumes:
      - ./data:/app/data
    restart: always
```

---

## 8. Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./pantry.db` | URL de la base de datos |
| `SECRET_KEY` | `pantry-sync-secret-key...` | Clave secreta JWT |
