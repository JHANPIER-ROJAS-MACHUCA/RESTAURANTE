function openModal(id){
document.getElementById(id).classList.add('show');
}

function closeModal(id){
document.getElementById(id).classList.remove('show');
}

document.querySelectorAll('.modal-overlay').forEach(m=>{
m.addEventListener('click',e=>{
if(e.target===m)m.classList.remove('show');
});
});

function abrirModalEstado(id){
estadoTarget=id;
const p=pedidos.find(x=>x.id===id);

document.querySelectorAll('.estado-opt')
.forEach(opt=>{
opt.classList.toggle('selected',opt.dataset.v===p.estado)
});

nuevoEstado=p.estado;
openModal('modal-estado');
}

function selectEstado(el){
document.querySelectorAll('.estado-opt')
.forEach(o=>o.classList.remove('selected'));
el.classList.add('selected');
nuevoEstado=el.dataset.v;
}