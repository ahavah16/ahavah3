const express   = require('express');
const router    = express.Router();
const db        = require('../db');
const adminAuth = require('../adminAuth');

const SERVICIOS = [
  'manicure_gel', 'nail_art', 'acrilico_polygel',
  'pedicure_spa', 'pack_novias', 'retiro_mantenimiento'
];

// ── PÚBLICO ──────────────────────────────────────────────────

// POST /api/citas — agendar una nueva cita
router.post('/', async (req, res) => {
  const { nombre, telefono, servicio, fecha_hora, notas } = req.body;

  if (!nombre?.trim() || !telefono?.trim() || !servicio || !fecha_hora) {
    return res.status(400).json({ error: 'Nombre, teléfono, servicio y fecha son requeridos' });
  }

  if (!SERVICIOS.includes(servicio)) {
    return res.status(400).json({ error: 'Servicio no válido', servicios_validos: SERVICIOS });
  }

  const fecha = new Date(fecha_hora);
  if (isNaN(fecha.getTime())) {
    return res.status(400).json({ error: 'Fecha inválida. Usa formato ISO: 2025-07-15T14:00:00' });
  }

  if (fecha < new Date()) {
    return res.status(400).json({ error: 'La fecha debe ser futura' });
  }

  try {
    const result = await db.query(`
      INSERT INTO citas (nombre, telefono, servicio, fecha_hora, notas)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, servicio, fecha_hora, estado
    `, [nombre.trim(), telefono.trim(), servicio, fecha, notas?.trim() || null]);

    res.status(201).json({
      message: '¡Cita agendada! Te contactaremos para confirmar.',
      cita: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agendar cita' });
  }
});

// ── ADMIN ────────────────────────────────────────────────────

// GET /api/citas — ver todas las citas (admin)
router.get('/', adminAuth, async (req, res) => {
  const { estado, fecha } = req.query;
  let query = 'SELECT * FROM citas WHERE 1=1';
  const params = [];

  if (estado) {
    params.push(estado);
    query += ` AND estado = $${params.length}`;
  }
  if (fecha) {
    params.push(fecha);
    query += ` AND fecha_hora::date = $${params.length}`;
  }

  query += ' ORDER BY fecha_hora ASC';

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// PATCH /api/citas/:id/estado — cambiar estado de cita (admin)
router.patch('/:id/estado', adminAuth, async (req, res) => {
  const { estado } = req.body;
  const estados = ['pendiente', 'confirmada', 'cancelada'];

  if (!estados.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido', estados_validos: estados });
  }

  try {
    const result = await db.query(`
      UPDATE citas SET estado = $1 WHERE id = $2 RETURNING *
    `, [estado, req.params.id]);

    if (!result.rows.length) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json({ message: `Cita ${estado}`, cita: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// DELETE /api/citas/:id — eliminar cita (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM citas WHERE id = $1', [req.params.id]);
    res.json({ message: 'Cita eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
});

module.exports = router;
