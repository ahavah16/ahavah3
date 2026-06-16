const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Función para obtener la IP real (Railway usa proxies)
function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'desconocida'
  );
}

// POST /api/visitas — registrar visita con IP y devolver estadísticas
router.post('/', async (req, res) => {
  try {
    const ip         = getIP(req);
    const user_agent = req.headers['user-agent'] || null;

    // Guardar la visita
    await db.query(
      'INSERT INTO visitas (ip, user_agent) VALUES ($1, $2)',
      [ip, user_agent]
    );

    // Devolver estadísticas
    const stats = await db.query(`
      SELECT
        COUNT(*)                                        AS total_visitas,
        COUNT(DISTINCT ip)                              AS visitas_unicas,
        COUNT(*) FILTER (WHERE fecha >= NOW() - INTERVAL '24 hours') AS hoy,
        COUNT(*) FILTER (WHERE fecha >= NOW() - INTERVAL '7 days')   AS esta_semana,
        COUNT(*) FILTER (WHERE fecha >= NOW() - INTERVAL '30 days')  AS este_mes
      FROM visitas
    `);

    res.json({
      total_visitas:  parseInt(stats.rows[0].total_visitas),
      visitas_unicas: parseInt(stats.rows[0].visitas_unicas),
      hoy:            parseInt(stats.rows[0].hoy),
      esta_semana:    parseInt(stats.rows[0].esta_semana),
      este_mes:       parseInt(stats.rows[0].este_mes),
      ip_actual:      ip,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar visita' });
  }
});

// GET /api/visitas — estadísticas generales (público)
router.get('/', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT
        COUNT(*)                                        AS total_visitas,
        COUNT(DISTINCT ip)                              AS visitas_unicas,
        COUNT(*) FILTER (WHERE fecha >= NOW() - INTERVAL '24 hours') AS hoy,
        COUNT(*) FILTER (WHERE fecha >= NOW() - INTERVAL '7 days')   AS esta_semana,
        COUNT(*) FILTER (WHERE fecha >= NOW() - INTERVAL '30 days')  AS este_mes
      FROM visitas
    `);

    res.json({
      total_visitas:  parseInt(stats.rows[0].total_visitas),
      visitas_unicas: parseInt(stats.rows[0].visitas_unicas),
      hoy:            parseInt(stats.rows[0].hoy),
      esta_semana:    parseInt(stats.rows[0].esta_semana),
      este_mes:       parseInt(stats.rows[0].este_mes),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener visitas' });
  }
});

// GET /api/visitas/detalle — ver lista de IPs (solo admin)
router.get('/detalle', async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const { rows } = await db.query(`
      SELECT
        ip,
        COUNT(*)           AS visitas,
        MIN(fecha)         AS primera_visita,
        MAX(fecha)         AS ultima_visita
      FROM visitas
      GROUP BY ip
      ORDER BY ultima_visita DESC
      LIMIT 100
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener detalle' });
  }
});

module.exports = router;
