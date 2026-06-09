const express   = require('express');
const router    = express.Router();
const db        = require('../db');
const adminAuth = require('../adminAuth');

// ── PÚBLICO ──────────────────────────────────────────────────

// GET /api/comentarios — traer comentarios aprobados
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, nombre, comentario, calificacion, created_at
      FROM   comentarios
      WHERE  aprobado = TRUE
      ORDER  BY created_at DESC
      LIMIT  50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// POST /api/comentarios — enviar un nuevo comentario (queda pendiente)
router.post('/', async (req, res) => {
  const { nombre, comentario, calificacion } = req.body;

  if (!nombre?.trim() || !comentario?.trim()) {
    return res.status(400).json({ error: 'Nombre y comentario son requeridos' });
  }

  const cal = parseInt(calificacion) || 5;
  if (cal < 1 || cal > 5) {
    return res.status(400).json({ error: 'Calificación debe ser entre 1 y 5' });
  }

  try {
    await db.query(`
      INSERT INTO comentarios (nombre, comentario, calificacion)
      VALUES ($1, $2, $3)
    `, [nombre.trim(), comentario.trim(), cal]);

    res.status(201).json({ message: 'Comentario recibido, pendiente de aprobación. ¡Gracias!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar comentario' });
  }
});

// ── ADMIN ────────────────────────────────────────────────────

// GET /api/comentarios/pendientes — ver los no aprobados (admin)
router.get('/pendientes', adminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM comentarios
      WHERE  aprobado = FALSE
      ORDER  BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pendientes' });
  }
});

// PATCH /api/comentarios/:id/aprobar — aprobar comentario (admin)
router.patch('/:id/aprobar', adminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE comentarios SET aprobado = TRUE WHERE id = $1 RETURNING *
    `, [req.params.id]);

    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Aprobado', comentario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al aprobar' });
  }
});

// DELETE /api/comentarios/:id — eliminar comentario (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM comentarios WHERE id = $1', [req.params.id]);
    res.json({ message: 'Comentario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;
