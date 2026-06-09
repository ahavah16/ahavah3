require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const visitasRouter    = require('./routes/visitas');
const comentariosRouter = require('./routes/comentarios');
const citasRouter      = require('./routes/citas');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────
app.use(cors({
  origin: '*', // en producción pon tu dominio: 'https://ahavah16.github.io'
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
app.use(express.json());

// Log simple de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ── RUTAS ─────────────────────────────────────
app.use('/api/visitas',     visitasRouter);
app.use('/api/comentarios', comentariosRouter);
app.use('/api/citas',       citasRouter);

// Health check (Railway lo usa para saber que la app vive)
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Ahavah Nails API' }));

// Ruta raíz con resumen de endpoints
app.get('/', (req, res) => {
  res.json({
    nombre: 'Ahavah Nails Studio — API',
    version: '1.0.0',
    endpoints: {
      visitas: {
        'POST /api/visitas':  'Registrar visita',
        'GET  /api/visitas':  'Consultar total'
      },
      comentarios: {
        'GET  /api/comentarios':              'Ver aprobados (público)',
        'POST /api/comentarios':              'Enviar comentario (público)',
        'GET  /api/comentarios/pendientes':   'Ver pendientes (admin)',
        'PATCH /api/comentarios/:id/aprobar': 'Aprobar comentario (admin)',
        'DELETE /api/comentarios/:id':        'Eliminar comentario (admin)'
      },
      citas: {
        'POST /api/citas':              'Agendar cita (público)',
        'GET  /api/citas':              'Ver todas las citas (admin)',
        'PATCH /api/citas/:id/estado':  'Cambiar estado (admin)',
        'DELETE /api/citas/:id':        'Eliminar cita (admin)'
      }
    },
    nota_admin: 'Endpoints admin requieren header: x-admin-secret: TU_CLAVE'
  });
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ── INICIAR ───────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Ahavah API corriendo en puerto ${PORT}`);
});
