const express = require('express');
const router  = express.Router();
const db      = require('../db');

// POST /api/visitas  — registrar una nueva visita y devolver el total
router.post('/', async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE visitas
      SET total      = total + 1,
          updated_at = NOW()
      WHERE id = 1
      RETURNING total
    `);
    res.json({ total: result.rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar visita' });
  }
});

// GET /api/visitas  — solo consultar el total actual
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT total FROM visitas WHERE id = 1');
    res.json({ total: result.rows[0]?.total ?? 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener visitas' });
  }
});

module.exports = router;
