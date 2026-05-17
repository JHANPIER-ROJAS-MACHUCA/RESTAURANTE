import { pedidos, filtroActual, setFiltroActual } from './state.js';
import { abrirModalEstado } from './modal.js';
import { editarPedido, eliminarPedido } from './pedidos.js';

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function renderTabla() {
  const tbody = document.getElementById('tabla-body');
  let lista = pedidos;
  if (filtroActual !== 'todos') lista = pedidos.filter(p => p.estado === filtroActual);

  tbody.innerHTML = lista.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td>${esc(p.cliente)}</td>
      <td>${esc(p.plato)}</td>
      <td>${p.cantidad}</td>
      <td>S/${p.precio_unitario}</td>
      <td><span class='badge' onclick='abrirModalEstado(${p.id})'>${p.estado}</span></td>
      <td>
        <button onclick='editarPedido(${p.id})'>✎</button>
        <button onclick='eliminarPedido(${p.id})'>🗑</button>
      </td>
    </tr>
  `).join('');

  const empty = document.getElementById('empty-state');
  if (empty) empty.style.display = lista.length ? 'none' : 'flex';
}

export function updateStats() {
  const total     = pedidos.length;
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const listos     = pedidos.filter(p => p.estado === 'listo').length;
  const ventas     = pedidos
    .filter(p => p.estado === 'entregado')
    .reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);

  document.getElementById('sum-total').textContent      = total;
  document.getElementById('sum-pendientes').textContent  = pendientes;
  document.getElementById('sum-listos').textContent      = listos;
  document.getElementById('sum-ventas').textContent      = 'S/' + ventas.toFixed(2);
}

export function setFiltro(estado, el) {
  setFiltroActual(estado);
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderTabla();
}

window.setFiltro     = setFiltro;
window.editarPedido  = editarPedido;
window.eliminarPedido = eliminarPedido;