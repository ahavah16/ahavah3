# Ahavah Nails Studio — API

Backend en Node.js + Express + PostgreSQL para la página web de Ahavah Nails.

---

## 🗂️ Estructura

```
ahavah-api/
├── src/
│   ├── index.js          ← servidor principal
│   ├── db.js             ← conexión a PostgreSQL
│   ├── adminAuth.js      ← middleware de autenticación
│   ├── schema.sql        ← script para crear las tablas
│   └── routes/
│       ├── visitas.js
│       ├── comentarios.js
│       └── citas.js
├── .env.example
├── .gitignore
└── package.json
```

---

## 🚀 Despliegue en Railway (paso a paso)

### 1. Preparar el repositorio

```bash
git init
git add .
git commit -m "Initial commit - Ahavah API"
git remote add origin https://github.com/TU_USUARIO/ahavah-api.git
git push -u origin main
```

### 2. Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) → **New Project**
2. Elige **Deploy from GitHub repo** → selecciona `ahavah-api`
3. Railway detecta Node.js automáticamente

### 3. Agregar PostgreSQL

1. En tu proyecto Railway → **+ New** → **Database** → **PostgreSQL**
2. Ve a la base de datos → **Variables**
3. Copia el valor de `DATABASE_URL`

### 4. Configurar variables de entorno

En Railway → tu servicio API → **Variables**, agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | (el que copiaste del paso 3) |
| `ADMIN_SECRET` | Una clave secreta tuya, ej: `ahavah_2025_$ecreta` |
| `PORT` | Railway lo asigna solo, no hace falta |

### 5. Crear las tablas

1. Railway → tu **PostgreSQL** → **Query**
2. Copia y pega el contenido de `src/schema.sql`
3. Ejecuta el script

### 6. Deploy

Railway hace deploy automático al hacer push a `main`. En 1-2 minutos tu API estará en:
```
https://ahavah-api-production.up.railway.app
```

---

## 🔌 Conectar con la página web

En tu `nail_studio_promo.html`, cambia la URL base:

```js
const API = 'https://TU-PROYECTO.up.railway.app';

// Contador de visitas
fetch(`${API}/api/visitas`, { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Visitas:', data.total));

// Enviar comentario
fetch(`${API}/api/comentarios`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre: 'Ana', comentario: 'Excelente!', calificacion: 5 })
});

// Agendar cita
fetch(`${API}/api/citas`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'María López',
    telefono: '2281234567',
    servicio: 'manicure_gel',       // ver servicios válidos abajo
    fecha_hora: '2025-07-15T14:00:00',
    notas: 'Quiero diseño floral'
  })
});
```

---

## 🔒 Endpoints de administrador

Todos los endpoints admin requieren el header:
```
x-admin-secret: TU_CLAVE_SECRETA
```

### Ver comentarios pendientes
```bash
curl https://TU-API.up.railway.app/api/comentarios/pendientes \
  -H "x-admin-secret: TU_CLAVE"
```

### Aprobar un comentario
```bash
curl -X PATCH https://TU-API.up.railway.app/api/comentarios/1/aprobar \
  -H "x-admin-secret: TU_CLAVE"
```

### Ver todas las citas
```bash
curl https://TU-API.up.railway.app/api/citas \
  -H "x-admin-secret: TU_CLAVE"

# Filtrar por estado
curl "https://TU-API.up.railway.app/api/citas?estado=pendiente" \
  -H "x-admin-secret: TU_CLAVE"

# Filtrar por fecha
curl "https://TU-API.up.railway.app/api/citas?fecha=2025-07-15" \
  -H "x-admin-secret: TU_CLAVE"
```

### Confirmar/cancelar una cita
```bash
curl -X PATCH https://TU-API.up.railway.app/api/citas/1/estado \
  -H "x-admin-secret: TU_CLAVE" \
  -H "Content-Type: application/json" \
  -d '{"estado": "confirmada"}'
```

---

## 💅 Servicios válidos

| Clave | Nombre |
|---|---|
| `manicure_gel` | Manicure en gel |
| `nail_art` | Nail art & diseño |
| `acrilico_polygel` | Acrílico & polygel |
| `pedicure_spa` | Pedicure spa |
| `pack_novias` | Pack novias |
| `retiro_mantenimiento` | Retiro & mantenimiento |

---

## 🛠️ Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Edita .env con tu DATABASE_URL de Railway

# 3. Correr en modo desarrollo
npm run dev
```
