# 🍱 NotTupper API

Backend REST para el emprendimiento de venta de viandas semanales.  
Construido con **Node.js + TypeScript + Express + Supabase**, siguiendo arquitectura limpia por capas.

---

## 🏗️ Arquitectura

```
src/
├── config/                  # Supabase, variables de entorno
├── domain/
│   ├── interfaces/          # Tipos e interfaces del negocio
│   └── repositories/        # Contratos (interfaces) de repositorios
├── application/
│   └── services/            # Lógica de negocio
└── infrastructure/
    ├── controllers/         # Manejo de request/response
    ├── repositories/        # Implementación Supabase
    ├── dtos/                # Validación de entrada
    ├── middlewares/         # Auth JWT, validación
    └── routes/              # Rutas Express
```

---

## 🚀 Instalación

```bash
git clone <repo>
cd nottupper-api
npm install
cp .env.example .env  # Completar con tus credenciales
npm run dev
```

---

## 🔑 Variables de entorno

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

---

## 📡 Endpoints

### Auth / Usuarios
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/users/register` | — | Registrar usuario |
| POST | `/api/users/login` | — | Login |
| GET | `/api/users/me` | USER | Mi perfil |
| PATCH | `/api/users/me` | USER | Actualizar perfil |
| GET | `/api/users` | ADMIN | Listar usuarios |
| DELETE | `/api/users/:id` | ADMIN | Eliminar usuario |

### Comidas (catálogo reutilizable)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/comidas` | — | Listar comidas (`?soloActivas=true`) |
| GET | `/api/comidas/:id` | — | Detalle |
| POST | `/api/comidas` | ADMIN | Crear |
| PATCH | `/api/comidas/:id` | ADMIN | Actualizar |
| PATCH | `/api/comidas/:id/toggle` | ADMIN | Activar/desactivar |
| DELETE | `/api/comidas/:id` | ADMIN | Eliminar |

### Viandas (menú activo)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/viandas` | — | Listar viandas (`?soloActivas=true`) |
| GET | `/api/viandas/:id` | — | Detalle con comidas |
| POST | `/api/viandas` | ADMIN | Crear |
| PATCH | `/api/viandas/:id` | ADMIN | Actualizar |
| PATCH | `/api/viandas/:id/toggle` | ADMIN | Activar/desactivar |
| PUT | `/api/viandas/:id/comidas` | ADMIN | Asignar comidas (reemplaza todas) |
| DELETE | `/api/viandas/:id/comidas/:comidaId` | ADMIN | Quitar comida |
| DELETE | `/api/viandas/:id` | ADMIN | Eliminar |

### Pedidos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/pedidos` | USER | Crear pedido |
| GET | `/api/pedidos/mis-pedidos` | USER | Mis pedidos |
| PATCH | `/api/pedidos/:id/cancelar` | USER | Cancelar pedido |
| GET | `/api/pedidos` | ADMIN | Todos los pedidos (`?estado=PENDIENTE`) |
| GET | `/api/pedidos/:id` | ADMIN | Detalle |
| PATCH | `/api/pedidos/:id/estado` | ADMIN | Cambiar estado |
| DELETE | `/api/pedidos/:id` | ADMIN | Eliminar |

---

## 🗄️ Base de datos

Ver el SQL completo en `/supabase/schema.sql`.

Tablas: `users`, `comidas`, `viandas`, `vianda_comidas`, `pedidos`

---

## 🎯 Flujo del sistema

**Admin:**
1. Crea comidas en el catálogo
2. Crea viandas y les asigna comidas
3. Activa las viandas del menú actual
4. Gestiona pedidos y actualiza estados

**Usuario:**
1. Ve el menú (`GET /api/viandas?soloActivas=true`)
2. Elige una vianda y hace el pedido
3. Contacta por WhatsApp (canal externo)
4. Consulta el estado de sus pedidos
