import { API_BASE } from './config.js';
import { pedidos, editando, deleteTarget, estadoTarget, nuevoEstado,
         setPedidos, setEditando, setDeleteTarget } from './state.js';
import { showToast }  from './toast.js';
import { openModal, closeModal } from './modal.js';
import { renderTabla, updateStats } from './ui.js';
import { apiFetch } from './api.js';

function validarForm() {
  const cliente  = document.getElementById('cliente').value.trim();
  const plato    = document.getElementById('plato').value.trim();
  const cantidad = document.getElementById('cantidad').value.trim();
  const precio   = document.getElementById('precio').value.trim();
  if (!cliente  || cliente.length < 2)               { showToast('Cliente mínimo 2 caracteres','error'); return false; }
  if (!plato    || plato.length < 2)                 { showToast('Plato mínimo 2 caracteres','error');   return false; }
  if (!cantidad || isNaN(cantidad) || +cantidad < 1) { showToast('Cantidad mayor a 0','error');           return false; }
  if (!precio   || isNaN(precio)   || +precio < 0)   { showToast('Precio inválido','error');              return false; }
  return true;
}

function resetForm() {
  setEditando(null);
  ['cliente','plato','cantidad','precio'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('estado-form').value            = 'pendiente';
  document.getElementById('btn-submit-text').textContent  = 'Registrar Pedido';
  document.getElementById('btn-submit-icon').textContent  = '＋';
  document.getElementById('btn-cancel-edit').style.display = 'none';
}

export async function submitPedido() {
  if (!validarForm()) return;
  const body = {
    cliente:         document.getElementById('cliente').value.trim(),
    plato:           document.getElementById('plato').value.trim(),
    cantidad:        parseInt(document.getElementById('cantidad').value),
    precio_unitario: parseFloat(document.getElementById('precio').value),
    estado:          document.getElementById('estado-form').value,
  };
  try {
    if (editando) {
      const res = await apiFetch(`/pedidos/${editando}`, { method:'PUT', body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      const idx = pedidos.findIndex(p => p.id === editando);
      pedidos[idx] = { ...pedidos[idx], ...body };
      showToast('Pedido actualizado', 'success');
    } else {
      const res  = await apiFetch('/pedidos', { method:'POST', body: JSON.stringify(body) });
      const data = await res.json();
      setPedidos([data.data || { id: Date.now(), ...body }, ...pedidos]);
      showToast('Pedido registrado', 'success');
    }
  } catch (e) { showToast('Error', 'error'); }
  resetForm(); renderTabla(); updateStats();
}

export function editarPedido(id) {
  const p = pedidos.find(x => x.id === id);
  setEditando(id);
  document.getElementById('cliente').value              = p.cliente;
  document.getElementById('plato').value                = p.plato;
  document.getElementById('cantidad').value             = p.cantidad;
  document.getElementById('precio').value               = p.precio_unitario;
  document.getElementById('estado-form').value          = p.estado;
  document.getElementById('btn-submit-text').textContent = 'Guardar Cambios';
  document.getElementById('btn-submit-icon').textContent = '✎';
  document.getElementById('btn-cancel-edit').style.display = 'block';
}

export function cancelEdit() { resetForm(); }

export function eliminarPedido(id) {
  setDeleteTarget(id);
  openModal('modal-delete');
}

export async function cargarPedidos() {
  try {
    const res = await apiFetch('/pedidos');
    if (!res) return;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setPedidos(data.data || []);
    renderTabla();
    updateStats();
  } catch (e) { showToast(e.message, 'error'); }
}

export async function confirmarDelete() {
  closeModal('modal-delete');
  try {
    const res = await apiFetch(`/pedidos/${deleteTarget}`, { method: 'DELETE' });
    if (!res || !res.ok) throw new Error((await res?.json())?.error || 'Error al eliminar');
    setPedidos(pedidos.filter(p => p.id !== deleteTarget));
    renderTabla(); updateStats();
    showToast('Pedido eliminado', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

export async function confirmarEstado() {
  closeModal('modal-estado');
  try {
    const res = await apiFetch(`/pedidos/${estadoTarget}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!res || !res.ok) throw new Error((await res?.json())?.error || 'Error al actualizar');
    const p = pedidos.find(x => x.id === estadoTarget);
    p.estado = nuevoEstado;
    renderTabla(); updateStats();
    showToast('Estado actualizado', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

window.submitPedido    = submitPedido;
window.cancelEdit      = cancelEdit;
window.confirmarDelete  = confirmarDelete;
window.confirmarEstado  = confirmarEstado;