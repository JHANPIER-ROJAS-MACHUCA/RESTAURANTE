function renderTabla(){
const tbody=document.getElementById('tabla-body');
let pedidosFiltrados=pedidos;
if(filtroActual!=='todos'){
pedidosFiltrados=pedidos.filter(p=>p.estado===filtroActual);
}
tbody.innerHTML=pedidosFiltrados.map(p=>`<tr><td>#${p.id}</td><td>${esc(p.cliente)}</td><td>${esc(p.plato)}</td><td>${p.cantidad}</td><td>S/${p.precio_unitario}</td><td><span class='badge' onclick='abrirModalEstado(${p.id})'>${p.estado}</span></td><td><button onclick='editarPedido(${p.id})'>✎</button><button onclick='eliminarPedido(${p.id})'>🗑</button></td></tr>`).join('');
}

function updateStats(){
const total=pedidos.length;
const pendientes=pedidos.filter(p=>p.estado==='pendiente').length;
const listos=pedidos.filter(p=>p.estado==='listo').length;
const ventas=pedidos.filter(p=>p.estado==='entregado').reduce((sum,p)=>sum+(p.cantidad*p.precio_unitario),0);
document.getElementById('sum-total').textContent=total;
document.getElementById('sum-pendientes').textContent=pendientes;
document.getElementById('sum-listos').textContent=listos;
document.getElementById('sum-ventas').textContent='S/'+ventas.toFixed(2);
}

function setFiltro(estado,el){
filtroActual=estado;
document.querySelectorAll('.chip')
.forEach(c=>c.classList.remove('active'));
el.classList.add('active');
renderTabla();
}