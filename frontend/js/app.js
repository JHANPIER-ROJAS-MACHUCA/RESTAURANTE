import './guard.js';
import './state.js';
import './toast.js';
import './modal.js';
import { renderTabla, updateStats, setFiltro } from './ui.js';
import { cargarPedidos, submitPedido, cancelEdit,
         confirmarDelete, confirmarEstado } from './pedidos.js';

document.addEventListener('DOMContentLoaded', () => {
  cargarPedidos();
});