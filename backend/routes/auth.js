// =====================================================
// routes/auth.js — Login / Logout / Perfil
// =====================================================
const express        = require('express');
const bcrypt         = require('bcrypt');
const jwt            = require('jsonwebtoken');
const db             = require('../db');
const { verificarToken, SECRET } = require('../middleware/auth');

const router = express.Router();

const ACCESS_EXPIRES  = '2h';   // token de acceso
const REFRESH_EXPIRES = '7d';   // refresh token

// ── POST /auth/login ──────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ ok: false, error: 'Email y contraseña requeridos' });

  try {
    // Buscar usuario activo con su rol
    const [rows] = await db.query(
      `SELECT u.id, u.nombre, u.email, u.password_hash, u.activo, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.email = ?`,
      [email.trim().toLowerCase()]
    );

    const usuario = rows[0];
    if (!usuario)
      return res.status(401).json({ ok: false, error: 'Credenciales incorrectas' });

    if (!usuario.activo)
      return res.status(403).json({ ok: false, error: 'Usuario desactivado' });

    const passwordOk = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordOk)
      return res.status(401).json({ ok: false, error: 'Credenciales incorrectas' });

    // Payload del token
    const payload = {
      id:     usuario.id,
      nombre: usuario.nombre,
      email:  usuario.email,
      rol:    usuario.rol,
    };

    const accessToken  = jwt.sign(payload, SECRET, { expiresIn: ACCESS_EXPIRES });
    const refreshToken = jwt.sign({ id: usuario.id }, SECRET, { expiresIn: REFRESH_EXPIRES });

    // Hashear refresh token antes de guardar en BD
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    
    // Guardar refresh token hasheado en BD
    const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO refresh_tokens (usuario_id, token, expira_en) VALUES (?, ?, ?)',
      [usuario.id, refreshTokenHash, expira]
    );

    // Actualizar último acceso
    await db.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [usuario.id]);

    return res.json({
      ok: true,
      data: {
        accessToken,
        refreshToken,
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Error en el servidor' });
  }
});

// ── POST /auth/refresh ────────────────────────────────
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ ok: false, error: 'Refresh token requerido' });

  try {
    const payload = jwt.verify(refreshToken, SECRET);

    const [rows] = await db.query(
      'SELECT token FROM refresh_tokens WHERE usuario_id = ? AND revocado = 0 AND expira_en > NOW()',
      [payload.id]
    );
    
    if (!rows.length)
      return res.status(401).json({ ok: false, error: 'Refresh token inválido o expirado' });

    // Verificar que el token hasheado coincida
    let tokenValido = false;
    for (const row of rows) {
      if (await bcrypt.compare(refreshToken, row.token)) {
        tokenValido = true;
        break;
      }
    }
    
    if (!tokenValido)
      return res.status(401).json({ ok: false, error: 'Refresh token inválido' });

    // Buscar usuario actualizado
    const [usuarios] = await db.query(
      `SELECT u.id, u.nombre, u.email, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ?`,
      [payload.id]
    );
    const u = usuarios[0];
    const newAccess = jwt.sign(
      { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol },
      SECRET,
      { expiresIn: ACCESS_EXPIRES }
    );

    return res.json({ ok: true, data: { accessToken: newAccess } });
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'Refresh token inválido' });
  }
});

// ── POST /auth/logout ─────────────────────────────────
router.post('/logout', verificarToken, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      const [rows] = await db.query(
        'SELECT token FROM refresh_tokens WHERE usuario_id = ? AND revocado = 0',
        [req.usuario.id]
      );
      for (const row of rows) {
        if (await bcrypt.compare(refreshToken, row.token)) {
          await db.query(
            'UPDATE refresh_tokens SET revocado = 1 WHERE usuario_id = ? AND revocado = 0',
            [req.usuario.id]
          );
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  return res.json({ ok: true, data: { message: 'Sesión cerrada' } });
});

// ── GET /auth/me ──────────────────────────────────────
router.get('/me', verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.ultimo_acceso
       FROM usuarios u JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ?`,
      [req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Error en el servidor' });
  }
});

module.exports = router;