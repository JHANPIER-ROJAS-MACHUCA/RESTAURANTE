// =====================================================
// routes/pedidos.js — CRUD protegido por JWT y roles
// =====================================================
const express                       = require('express');
const db                            = require('../db');
const { verificarToken, autorizar } = require('../middleware/auth');

const router = express.Router();

router.use(verificarToken);

// ── Helpers ───────────────────────────────────────────
const ok  = (res, data, status = 200) => res.status(status).json({ ok: true,  data });
const err = (res, msg,  status = 500) => res.status(status).json({ ok: false, error: msg });

function validarPedido(body, parcial = false) {
  const { cliente, plato, cantidad, precio_unitario, estado } = body;
  const estados = ['pendiente','en_preparacion','listo','entregado','cancelado'];
  const errores = [];

  if (!parcial || cliente !== undefined)
    if (!cliente || cliente.trim().length < 2)
      errores.push('cliente: mínimo 2 caracteres');

  if (!parcial || plato !== undefined)
    if (!plato || plato.trim().length < 2)
      errores.push('plato: mínimo 2 caracteres');

  if (!parcial || cantidad !== undefined)
    if (!Number.isInteger(cantidad) || cantidad < 1)
      errores.push('cantidad: entero >= 1');

  if (!parcial || precio_unitario !== undefined)
    if (typeof precio_unitario !== 'number' || precio_unitario < 0)
      errores.push('precio_unitario: número >= 0');

  if (estado !== undefined && !estados.includes(estado))
    errores.push(`estado debe ser: ${estados.join(', ')}`);

  return errores;
}

// ── GET /pedidos ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;
    let sql = `SELECT p.*, u.nombre AS registrado_por
               FROM pedidos p
               LEFT JOIN usuarios u ON u.id = p.creado_por
               ORDER BY p.fecha_creacion DESC`;
    const params = [];

    if (estado) {
      sql = `SELECT p.*, u.nombre AS registrado_por
             FROM pedidos p
             LEFT JOIN usuarios u ON u.id = p.creado_por
             WHERE p.estado = ?
             ORDER BY p.fecha_creacion DESC`;
      params.push(estado);
    }

    const [rows] = await db.query(sql, params);
    ok(res, rows);
  } catch (e) {
    console.error(e);
    err(res, 'Error al obtener pedidos');
  }
});

// ── GET /pedidos/stats/ventas ─────────────────────────
router.get('/stats/ventas', autorizar('administrador'), async (req, res) => {
  try {
    const [porEstado] = await db.query(`
      SELECT estado, COUNT(*) AS cantidad, SUM(cantidad * precio_unitario) AS subtotal
      FROM pedidos GROUP BY estado
    `);
    const [totalRow] = await db.query(`
      SELECT SUM(cantidad * precio_unitario) AS total
      FROM pedidos WHERE estado = 'entregado'
    `);
    ok(res, { por_estado: porEstado, total_ventas: totalRow[0].total || 0 });
  } catch (e) {
    err(res, 'Error al obtener ventas');
  }
});

// ── GET /pedidos/:id ──────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.nombre AS registrado_por
       FROM pedidos p
       LEFT JOIN usuarios u ON u.id = p.creado_por
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return err(res, 'Pedido no encontrado', 404);
    ok(res, rows[0]);
  } catch (e) {
    err(res, 'Error al obtener el pedido');
  }
});

// ── POST /pedidos ─────────────────────────────────────
router.post('/', autorizar('administrador', 'mesero'), async (req, res) => {
  const { cliente, plato, cantidad, precio_unitario, estado = 'pendiente' } = req.body;
  const errores = validarPedido({ cliente, plato, cantidad, precio_unitario, estado });
  if (errores.length) return err(res, errores.join(' | '), 400);

  try {
    const [result] = await db.query(
      `INSERT INTO pedidos (cliente, plato, cantidad, precio_unitario, estado, creado_por)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cliente.trim(), plato.trim(), cantidad, precio_unitario, estado, req.usuario.id]
    );
    const [rows] = await db.query('SELECT * FROM pedidos WHERE id = ?', [result.insertId]);
    ok(res, rows[0], 201);
  } catch (e) {
    console.error(e);
    err(res, 'Error al crear el pedido');
  }
});

// ── PUT /pedidos/:id ──────────────────────────────────
router.put('/:id', async (req, res) => {
  const { rol, id: userId } = req.usuario;
  const pedidoId = req.params.id;

  try {
    const [existing] = await db.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    if (!existing.length) return err(res, 'Pedido no encontrado', 404);
    const pedido = existing[0];

    // Cocina: solo puede cambiar estado a en_preparacion o listo
    if (rol === 'cocina') {
      const { estado } = req.body;
      if (!estado) return err(res, 'Cocina solo puede actualizar el estado', 400);
      const permitidos = ['en_preparacion', 'listo'];
      if (!permitidos.includes(estado))
        return err(res, 'Cocina solo puede cambiar a: en_preparacion, listo', 403);
      await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, pedidoId]);
      const [rows] = await db.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
      return ok(res, rows[0]);
    }

    // Mesero: solo edita sus propios pedidos
    if (rol === 'mesero' && pedido.creado_por !== userId)
      return err(res, 'Solo puedes editar tus propios pedidos', 403);

    // Administrador o mesero con su pedido: edición completa
    const { cliente, plato, cantidad, precio_unitario, estado } = req.body;
    const errores = validarPedido({ cliente, plato, cantidad, precio_unitario, estado }, true);
    if (errores.length) return err(res, errores.join(' | '), 400);

    const campos = [], valores = [];
    if (cliente         !== undefined) { campos.push('cliente = ?');         valores.push(cliente.trim()); }
    if (plato           !== undefined) { campos.push('plato = ?');           valores.push(plato.trim()); }
    if (cantidad        !== undefined) { campos.push('cantidad = ?');        valores.push(cantidad); }
    if (precio_unitario !== undefined) { campos.push('precio_unitario = ?'); valores.push(precio_unitario); }
    if (estado          !== undefined) { campos.push('estado = ?');          valores.push(estado); }

    if (!campos.length) return err(res, 'No se enviaron campos a actualizar', 400);

    valores.push(pedidoId);
    await db.query(`UPDATE pedidos SET ${campos.join(', ')} WHERE id = ?`, valores);
    const [rows] = await db.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    ok(res, rows[0]);
  } catch (e) {
    console.error(e);
    err(res, 'Error al actualizar el pedido');
  }
});

// ── DELETE /pedidos/:id ───────────────────────────────
router.delete('/:id', autorizar('administrador'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM pedidos WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return err(res, 'Pedido no encontrado', 404);
    ok(res, { message: 'Pedido eliminado correctamente' });
  } catch (e) {
    err(res, 'Error al eliminar el pedido');
  }
});

module.exports = router;