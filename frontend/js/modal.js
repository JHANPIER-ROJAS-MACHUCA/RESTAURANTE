import { pedidos, estadoTarget, setEstadoTarget, setNuevoEstado, nuevoEstado } from './state.js';
import { showToast } from './toast.js';

export function openModal(id) {
  document.getElementById(id).classList.add('show');
}

export function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

export function abrirModalEstado(id) {
  setEstadoTarget(id);
  const p = pedidos.find(x => x.id === id);
  document.querySelectorAll('.estado-opt')
    .forEach(opt => opt.classList.toggle('selected', opt.dataset.v === p.estado));
  setNuevoEstado(p.estado);
  openModal('modal-estado');
}

export function selectEstado(el) {
  document.querySelectorAll('.estado-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  setNuevoEstado(el.dataset.v);
}

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('show');
  });
});

window.closeModal      = closeModal;
window.selectEstado    = selectEstado;
window.abrirModalEstado = abrirModalEstado;