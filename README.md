# Inventory 360

Sistema de gestión de inventario inteligente con asistente de IA.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

*   **Backend**: Node.js con Express y MongoDB.
*   **Frontend**: React con Vite.

## Requisitos Previos

*   Node.js (v18 o superior)
*   MongoDB (local o Atlas)

## Instalación

1.  Clonar el repositorio.
2.  Instalar dependencias del backend:
    ```bash
    cd src/backend
    npm install
    ```
3.  Instalar dependencias del frontend:
    ```bash
    cd src/frontend
    npm install
    ```

## Configuración

Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example` si existe) con las siguientes variables:

```env
PORT=3000
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=tu_secreto_jwt
GEMINI_API_KEY=tu_api_key_de_gemini
```

## Ejecución

### Backend
```bash
npm start
# o para desarrollo
npm run dev
```

### Frontend
```bash
npm run dev
```

## Credenciales por Defecto

*   **Email:** `admin@inventory360.com`
*   **Password:** `123456`

## Scripts Útiles

*   `node src/backend/seed_admin.js`: Crea el usuario administrador por defecto si no existe.
