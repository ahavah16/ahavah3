require('dotenv').config();

// Middleware: verifica que el header x-admin-secret sea correcto
function adminAuth(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

module.exports = adminAuth;
