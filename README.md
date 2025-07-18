# Sistema de Gestión de Transferencias

Sistema intranet para gestión de transferencias desarrollado con Node.js, Express.js y SQLite.

## Estructura del Proyecto

```
calidad-software/
├── backend/           # Servidor Express.js con SQLite
├── frontend/          # Interfaz HTML/CSS/JS
└── README.md         # Este archivo
```

## Requisitos Previos

- Node.js (versión 16 o superior)
- npm (incluido con Node.js)

## Instalación y Ejecución

### 1. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 2. Inicializar la Base de Datos

```bash
cd backend
npm run init-db
```

### 3. Ejecutar el Servidor Backend

**Servidor Original (server.js):**
```bash
cd backend
npm start
```

**Nuevo Servidor (index.js):**
```bash
cd backend
npm run start-new
```

El servidor se ejecutará en: `http://localhost:3000`

### 4. Probar la API (Opcional)

```bash
cd backend
npm run test-api
```

### 5. Abrir el Frontend

Abrir el archivo `frontend/index.html` en tu navegador web.

O ejecutar un servidor local para el frontend:

```bash
cd frontend
npx http-server -p 8080
```

Luego abrir: `http://localhost:8080`

## Características

- **Backend**: API REST con Express.js y base de datos SQLite
- **Frontend**: Interfaz responsive con HTML, CSS y JavaScript vanilla
- **Gestión de Transferencias**: CRUD completo para transferencias
- **Base de Datos**: SQLite para almacenamiento local

## Endpoints de la API

### Servidor Original (server.js)
- `GET /api/transferencias` - Obtener todas las transferencias
- `POST /api/transferencias` - Crear nueva transferencia
- `PUT /api/transferencias/:id` - Actualizar transferencia
- `DELETE /api/transferencias/:id` - Eliminar transferencia

### Nuevo Servidor (index.js)
- `GET /transfers` - Listar todas las transferencias
- `POST /transfers` - Crear una nueva transferencia
- `PUT /transfers/:id` - Actualizar una transferencia
- `DELETE /transfers/:id` - Eliminar una transferencia
- `GET /transfers/:id` - Obtener una transferencia específica
- `GET /health` - Verificar estado del servidor

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js, SQLite3
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Base de Datos**: SQLite

## Desarrollo

Este proyecto es la base para el sistema intranet empresarial que incluirá:
- Módulo RR.HH (vacaciones/capacitaciones)
- Módulo Control Interno (reclamos/SAPC)
- Módulo Comercial (solicitudes precio)
- Módulo Calendario 