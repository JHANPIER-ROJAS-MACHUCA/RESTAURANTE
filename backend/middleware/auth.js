// =====================================================
// middleware/auth.js — JWT + control de roles
// =====================================================
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'cambia_este_secreto_en_produccion';

/**
 * Verifica el JWT enviado en el header Authorization: Bearer <token>
 * Adjunta req.usuario = { id, nombre, email, rol }
 */
function verificarToken(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ ok: false, error: 'Token requerido' });

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.usuario = payload;
    next();
  } catch (e) {
    const msg = e.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(401).json({ ok: false, error: msg });
  }
}

/**
 * Fábrica de middleware para restringir por rol.
 * Uso: router.post('/ruta', verificarToken, autorizar('admin','mesero'), handler)
 */
function autorizar(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario?.rol))
      return res.status(403).json({
        ok: false,
        error: `Acceso denegado. Rol requerido: ${roles.join(' o ')}`,
      });
    next();
  };
}

module.exports = { verificarToken, autorizar, SECRET };