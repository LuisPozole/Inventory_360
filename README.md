<div align="center">

# 📦 Inventory 360

### Sistema Inteligente de Gestión de Inventario con IA

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/Licencia-ISC-blue?style=for-the-badge)](LICENSE)

**Inventory 360** es una aplicación web full-stack de gestión de inventarios que integra **Inteligencia Artificial (Google Gemini)** para automatizar operaciones mediante lenguaje natural — tanto por texto como por voz. Diseñada con una interfaz moderna, dark mode, gráficas interactivas, y un sistema de roles (Admin/Vendedor), ofrece una experiencia completa y profesional para la administración de productos, ventas y análisis predictivo.

[Características](#-características-principales) •
[Capturas de Pantalla](#-capturas-de-pantalla) •
[Arquitectura](#-arquitectura) •
[Instalación](#-instalación-y-configuración) •
[Tecnologías](#-stack-tecnológico) •
[API Reference](#-api-endpoints)

</div>

---

## ✨ Características Principales

### 🤖 Asistente de IA (Chatbot + Voz)
- **Procesamiento de Lenguaje Natural (NLP):** Interactúa con el inventario usando frases como *"Añade 10 jabones a $25 en higiene"* o *"¿Cuánto stock tiene la cocacola?"*
- **Chat por Texto con historial persistente:** Conversaciones almacenadas en MongoDB con contexto multi-turno
- **Asistente por Voz:** Reconocimiento de voz (Web Speech API) + Síntesis de voz (TTS) con animaciones reactivas al audio
- **Operaciones CRUD vía Chat:** Añadir, modificar, eliminar productos y actualizar stock sin tocar un formulario
- **Búsqueda Fuzzy Inteligente:** El chatbot entiende plurales en español (*jabones → jabón*), variantes y coincidencias parciales
- **Tono Configurable:** Profesional, Amigable o Directo — personalizable desde ajustes

### 📊 Dashboard con Analíticas
- **KPIs en tiempo real:** Ventas del día, stock total, productos activos, rotación promedio
- **Comparativas porcentuales** (hoy vs. ayer) con indicadores visuales
- **Gráfica de Predicción de Demanda (IA):** Demanda Mensual Real vs. Predicción con proyección a 2 meses futuros
- **Demanda por Categoría** con gráficas de barras
- **Recomendaciones IA** automáticas por tendencia de categoría (subida/bajada/estable)
- **Alertas de Stock Crítico** en tiempo real con severidad (crítico / bajo)
- **Generación de Reporte Estratégico (PDF):** Informe ejecutivo generado por IA con diagnóstico, puntos críticos y recomendaciones accionables

### 📋 Gestión de Inventario
- **CRUD completo de productos** con SKU generado automáticamente
- **Categorías dinámicas** (crear nuevas sobre la marcha)
- **Filtros avanzados:** Búsqueda por nombre/SKU, filtro por categoría y por estado
- **Indicadores visuales de stock:** Semáforo rojo/verde con umbrales configurables por producto
- **Imágenes de producto** con upload via Multer
- **Edición inline** de precio, nombre, categoría y umbral crítico

### 👥 Sistema de Roles y Acceso
| Función | Admin | Vendedor |
|---------|:-----:|:--------:|
| Ver Dashboard completo con analíticas | ✅ | ❌ |
| Gestionar inventario (CRUD) | ✅ | ❌ |
| Chatbot IA (texto y voz) | ✅ | ✅ |
| Catálogo de productos (vista tienda) | ❌ | ✅ |
| Carrito de compras y checkout | ❌ | ✅ |
| Generar reporte estratégico (PDF) | ✅ | ❌ |
| Crear usuarios | ✅ | ❌ |
| Editar perfil propio | ✅ | ✅ |

### 🛒 Vista de Vendedor (POS)
- **Catálogo de productos** con búsqueda, filtros y diseño tipo e-commerce
- **Vista de detalle de producto** con información completa
- **Carrito de compras (Drawer)** con cálculo automático de totales
- **Proceso de checkout** con validación de stock y registro de transacciones
- **Panel personal** con métricas del vendedor

### ⚙️ Configuración Avanzada
- **Tema Claro / Oscuro** con persistencia
- **Notificaciones por correo** de alertas de stock (Nodemailer con Ethereal para testing)
- **Tono de IA configurable**
- **Moneda personalizable** (MXN, USD, EUR)
- **Cambio de contraseña** con validación bcrypt
- **Gestión de accesos** (solo Admin)

---

## 📸 Capturas de Pantalla

<details open>
<summary><strong>🔐 Login</strong></summary>
<br>

<div align="center">

![Login Screen](docs/screenshots/login.png)

*Pantalla de autenticación con diseño glassmorphism y gradient background*

</div>
</details>

<details open>
<summary><strong>📊 Dashboard (Admin)</strong></summary>
<br>

<div align="center">

![Dashboard](docs/screenshots/dashboard.png)

*Dashboard principal con KPIs, predicción de demanda por IA, alertas de stock crítico, demanda por categoría y recomendaciones inteligentes*

</div>
</details>

<details open>
<summary><strong>📦 Gestión de Inventario</strong></summary>
<br>

<div align="center">

![Inventory](docs/screenshots/inventory.png)

*Tabla de inventario con filtros, estados de stock (semáforo), acciones de edición y eliminación*

</div>
</details>

<details open>
<summary><strong>🤖 Chatbot de IA</strong></summary>
<br>

<div align="center">

![Chatbot](docs/screenshots/chatbot.png)

*Asistente de inventario con IA: historial persistente, operaciones por lenguaje natural y soporte de voz*

</div>
</details>

<details open>
<summary><strong>👤 Perfil de Usuario</strong></summary>
<br>

<div align="center">

![Profile](docs/screenshots/profile.png)

*Perfil de usuario con foto, información personal editable y rol del sistema*

</div>
</details>

---

## 🏗 Arquitectura

```
Inventory_360/
├── 📄 package.json               # Configuración raíz (scripts: start, dev)
├── 📄 .env                       # Variables de entorno (no versionado)
├── 📄 .gitignore
│
├── 📂 src/
│   ├── 📂 backend/               # ─── API REST (Node.js + Express 5) ───
│   │   ├── 📄 server.js          # Entry point, CORS, rutas
│   │   ├── 📂 controllers/
│   │   │   ├── authController.js       # Login, registro, JWT, /me
│   │   │   ├── chatController.js       # Chat texto + voz con Gemini
│   │   │   ├── checkoutController.js   # Proceso de venta (POS)
│   │   │   ├── dashboardController.js  # KPIs, alertas, predicciones, reporte IA
│   │   │   ├── productController.js    # CRUD de productos
│   │   │   └── profileController.js    # Perfil + upload de imagen
│   │   ├── 📂 models/
│   │   │   ├── User.js            # Usuarios (Admin / Vendedor)
│   │   │   ├── Product.js         # Productos con status auto-calculado
│   │   │   ├── Category.js        # Categorías dinámicas
│   │   │   ├── StockTransaction.js # Registro de ventas/ajustes
│   │   │   ├── ChatLog.js         # Historial de conversaciones IA
│   │   │   └── AppConfig.js       # Configuración global
│   │   ├── 📂 services/
│   │   │   ├── geminiService.js   # ★ Core IA: clasificación de intención,
│   │   │   │                      #   búsqueda fuzzy, CRUD por NLP,
│   │   │   │                      #   generación de reportes estratégicos
│   │   │   └── emailService.js    # Alertas por correo (Nodemailer)
│   │   ├── 📂 middlewares/
│   │   │   └── authMiddleware.js  # Verificación JWT
│   │   ├── 📂 routes/             # Definición de endpoints REST
│   │   └── 📂 uploads/            # Almacenamiento de imágenes
│   │
│   └── 📂 frontend/              # ─── SPA (React 19 + Vite 5) ───
│       ├── 📂 src/
│       │   ├── 📄 App.jsx         # Router principal + auth state
│       │   ├── 📄 App.css         # Estilos globales
│       │   ├── 📄 Theme.css       # Variables CSS (dark/light mode)
│       │   ├── 📂 components/
│       │   │   ├── Login.jsx           # Pantalla de autenticación
│       │   │   ├── Dashboard.jsx       # Panel principal (Admin)
│       │   │   ├── Inventory.jsx       # Gestión de inventario (Admin)
│       │   │   ├── ChatPage.jsx        # Chat completo con historial
│       │   │   ├── ChatWidget.jsx      # Widget flotante de chat
│       │   │   ├── VoiceChatOverlay.jsx # Asistente de voz IA
│       │   │   ├── Profile.jsx         # Perfil de usuario
│       │   │   ├── Settings.jsx        # Configuración del sistema
│       │   │   ├── Sidebar.jsx         # Menú lateral (Admin)
│       │   │   └── 📂 user/            # ─── Vistas Vendedor ───
│       │   │       ├── UserLayout.jsx      # Layout principal vendedor
│       │   │       ├── UserDashboard.jsx   # Panel del vendedor
│       │   │       ├── ProductCatalog.jsx  # Catálogo tipo tienda
│       │   │       ├── ProductDetail.jsx   # Detalle de producto
│       │   │       ├── CartDrawer.jsx      # Carrito lateral
│       │   │       ├── UserProfile.jsx     # Perfil vendedor
│       │   │       └── UserSidebar.jsx     # Sidebar vendedor
│       │   └── 📂 config/
│       │       └── api.js          # Axios instance con token JWT
│       └── 📄 vite.config.js
│
├── 📂 docs/
│   └── 📂 screenshots/           # Capturas de pantalla para README
└── 📂 tests/                     # Tests (en desarrollo)
```

### Flujo de Datos

```mermaid
graph TD
    A[👤 Usuario] -->|Login / JWT| B[React Frontend]
    B -->|API REST| C[Express Backend]
    C -->|Mongoose ODM| D[(MongoDB Atlas)]
    C -->|Prompt Engineering| E[🤖 Google Gemini 2.5 Flash]
    E -->|JSON Estructurado| C
    C -->|Alertas Email| F[📧 Nodemailer]
    B -->|Web Speech API| G[🎙 Reconocimiento de Voz]
    B -->|SpeechSynthesis| H[🔊 Síntesis de Voz]
    
    style E fill:#8E75B2,color:#fff
    style D fill:#47A248,color:#fff
    style B fill:#61DAFB,color:#000
    style C fill:#333,color:#fff
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

| Requisito | Versión |
|-----------|---------|
| Node.js | v18 o superior |
| npm | v9+ |
| MongoDB | Local o Atlas |
| Gemini API Key | [Obtener aquí](https://aistudio.google.com/app/apikey) |

### 1. Clonar el Repositorio

```bash
git clone https://github.com/LuisPozole/Inventory_360.git
cd Inventory_360
```

### 2. Instalar Dependencias

```bash
# Backend (raíz del proyecto)
npm install

# Frontend
cd src/frontend
npm install
cd ../..
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# ─── Base de Datos ───
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/inventory360

# ─── Autenticación ───
JWT_SECRET=tu_secreto_jwt_seguro
PORT=3000

# ─── Inteligencia Artificial ───
GEMINI_API_KEY=tu_api_key_de_google_gemini

# ─── CORS (opcional) ───
CORS_ORIGIN=http://localhost:5173

# ─── Email Alerts (opcional) ───
# Si no se configuran, se usa Ethereal (fake email) automáticamente
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=tu_email@gmail.com
# SMTP_PASS=tu_app_password
```

### 4. Crear el Usuario Administrador

```bash
node src/backend/seed_admin.js
```

Esto crea un usuario Admin con las credenciales:
- **Email:** `admin@inventory360.com`
- **Password:** `123456`

### 5. Ejecutar en Desarrollo

```bash
# En una terminal — Backend (API):
npm run dev

# En otra terminal — Frontend (UI):
cd src/frontend
npm run dev
```

La aplicación estará disponible en:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000`

---

## 🛠 Stack Tecnológico

### Backend
| Tecnología | Uso |
|------------|-----|
| **Node.js** + **Express 5** | Servidor API REST |
| **Mongoose 9** | ODM para MongoDB |
| **Google Gemini AI** (`@google/generative-ai`) | NLP: clasificación de intención, procesamiento de comandos, generación de reportes |
| **JWT** (`jsonwebtoken`) | Autenticación stateless |
| **bcryptjs** | Hashing de contraseñas |
| **Multer** | Upload de imágenes (perfiles, productos) |
| **Nodemailer** | Alertas de stock por email |
| **express-validator** | Validación de inputs |
| **Nodemon** | Hot-reload en desarrollo |

### Frontend
| Tecnología | Uso |
|------------|-----|
| **React 19** | UI Framework (SPA) |
| **Vite 5** | Build tool + dev server |
| **Recharts** | Gráficas interactivas (líneas, barras) |
| **Lucide React** | Iconografía moderna |
| **React Icons** | Iconos adicionales (voz, chat) |
| **Axios** | Cliente HTTP con interceptores JWT |
| **jsPDF** | Generación de reportes PDF en cliente |
| **Web Speech API** | Reconocimiento y síntesis de voz nativa del navegador |
| **CSS Custom Properties** | Sistema de temas (dark/light) sin librerías |

### Base de Datos
| Colección | Descripción |
|-----------|-------------|
| `users` | Usuarios con roles (Admin/Vendedor), perfil, imagen |
| `products` | Productos con SKU, categoría, stock, umbral crítico, status automático |
| `categories` | Categorías dinámicas creadas por admin o IA |
| `stocktransactions` | Historial de ventas, reabastecimientos y ajustes IA |
| `chatlogs` | Historial de conversaciones con el asistente IA |
| `appconfigs` | Configuración global del sistema |

---

## 🔌 API Endpoints

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/login` | Iniciar sesión (devuelve JWT) | ❌ |
| `POST` | `/register` | Registro público | ❌ |
| `POST` | `/create-user` | Crear usuario (Admin only) | 🔒 |
| `GET` | `/me` | Obtener datos del usuario actual | 🔒 |

### Productos (`/api/products`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/` | Listar todos los productos | 🔒 |
| `GET` | `/:id` | Obtener producto por ID | 🔒 |
| `POST` | `/` | Crear producto (con imagen) | 🔒 |
| `PUT` | `/:id` | Actualizar producto | 🔒 |
| `DELETE` | `/:id` | Eliminar producto | 🔒 |
| `GET` | `/categories` | Listar categorías | 🔒 |
| `POST` | `/categories` | Crear categoría | 🔒 |

### Dashboard (`/api/dashboard`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/stats` | KPIs generales | 🔒 |
| `GET` | `/alerts` | Alertas de stock crítico | 🔒 |
| `GET` | `/demand-prediction` | Predicción de demanda mensual | 🔒 |
| `GET` | `/category-demand` | Demanda por categoría (30 días) | 🔒 |
| `GET` | `/recommendations` | Recomendaciones IA por tendencia | 🔒 |
| `GET` | `/strategy-report` | Reporte estratégico generado por IA | 🔒👑 |
| `GET` | `/test-email` | Enviar correo de prueba | 🔒👑 |

### Chat IA (`/api/chat`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/` | Enviar mensaje al chatbot IA | 🔒 |
| `POST` | `/voice` | Enviar texto transcrito (voz) | 🔒 |
| `GET` | `/history` | Obtener historial de chat | 🔒 |
| `DELETE` | `/history` | Limpiar historial | 🔒 |

### Perfil (`/api/profile`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/` | Obtener perfil del usuario | 🔒 |
| `PUT` | `/` | Actualizar datos del perfil | 🔒 |
| `POST` | `/image` | Subir foto de perfil | 🔒 |
| `PUT` | `/password` | Cambiar contraseña | 🔒 |

### Checkout (`/api/checkout`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/` | Procesar venta (Vendedor POS) | 🔒 |

> 🔒 = Requiere JWT &nbsp;&nbsp; 👑 = Solo Admin

---

## 🧠 Integración con IA — Cómo Funciona

El sistema utiliza **Google Gemini 2.5 Flash** con un pipeline de 2 pasos:

### Paso 1: Clasificación de Intención
El mensaje del usuario se envía a Gemini con un prompt especializado que clasifica la intención en una de estas acciones:

| Acción | Descripción | Ejemplo de Input |
|--------|-------------|------------------|
| `ADD_PRODUCT` | Añadir producto | *"Agrega jabón de manos a $25"* |
| `UPDATE_PRODUCT` | Modificar producto | *"Cambia el precio del jabón a $30"* |
| `DELETE_PRODUCT` | Eliminar producto | *"Elimina el jabón del inventario"* |
| `UPDATE_STOCK` | Modificar stock | *"Pon el stock de cocacola en 50"* |
| `CHECK_STOCK` | Consultar producto | *"¿Cuánto cuesta el pollo?"* |
| `LIST_PRODUCTS` | Listar productos | *"Muestra los productos de bebidas"* |
| `GENERAL_CHAT` | Conversación general | *"Hola, ¿cómo estás?"* |

### Paso 2: Ejecución de la Acción
Según la intención clasificada, el backend ejecuta la operación correspondiente en MongoDB y devuelve una respuesta formateada (texto o voz).

**Características especiales:**
- **Conversación multi-turno:** El chatbot recuerda el contexto previo para flujos paso a paso (ej: añadir producto campo por campo)
- **Búsqueda fuzzy en español:** Manejo automático de plurales, acentos y variantes (*jabones → jabón*, *refrescos → refresco*)
- **Respuestas adaptadas a voz:** Cuando se usa el asistente de voz, las respuestas se simplifican para ser habladas naturalmente

---

## 📄 Licencia

Este proyecto está bajo la licencia [ISC](https://opensource.org/licenses/ISC).

---

<div align="center">

**Desarrollado con ❤️ por [Luis Pozole](https://github.com/LuisPozole)**

[![GitHub](https://img.shields.io/badge/GitHub-LuisPozole-181717?style=for-the-badge&logo=github)](https://github.com/LuisPozole)

</div>
