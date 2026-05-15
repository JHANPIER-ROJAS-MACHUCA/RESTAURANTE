function renderTabla(){
const tbody=document.getElementById('tabla-body');tbody.innerHTML=pedidos.map(p=>`<tr><td>#${p.id}</td><td>${esc(p.cliente)}</td><td>${esc(p.plato)}</td><td>${p.cantidad}</td><td>S/${p.precio_unitario}</td><td><span class='badge' onclick='abrirModalEstado(${p.id})'>${p.estado}</span></td><td><button onclick='editarPedido(${p.id})'>✎</button><button onclick='eliminarPedido(${p.id})'>🗑</button></td></tr>`).join('');
}

function updateStats(){
document.getElementById('sum-total').textContent=pedidos.length;
}

function setFiltro(estado,el){
filtroActual=estado;
document.querySelectorAll('.chip')
.forEach(c=>c.classList.remove('active'));
el.classList.add('active');
renderTabla();
}