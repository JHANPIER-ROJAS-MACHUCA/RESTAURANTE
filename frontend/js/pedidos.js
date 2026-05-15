async function submitPedido(){
if(!validarForm())return;
const body={cliente:document.getElementById('cliente').value.trim(),plato:document.getElementById('plato').value.trim(),cantidad:parseInt(document.getElementById('cantidad').value),precio_unitario:parseFloat(document.getElementById('precio').value),estado:document.getElementById('estado-form').value};
try{
if(editando){
const res=await fetch(`${API}/pedidos/${editando}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
if(!res.ok) throw new Error();
const idx=pedidos.findIndex(p=>p.id===editando);
pedidos[idx]={...pedidos[idx],...body};
showToast('Pedido actualizado','success');
}else{
const res=await fetch(`${API}/pedidos`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const nuevo=await res.json();
pedidos.unshift(nuevo.data||{id:Date.now(),...body});
showToast('Pedido registrado','success');
}
}catch(e){showToast('Error','error')}
resetForm();renderTabla();updateStats();
}

function editarPedido(id){
const p=pedidos.find(x=>x.id===id);editando=id;document.getElementById('cliente').value=p.cliente;document.getElementById('plato').value=p.plato;document.getElementById('cantidad').value=p.cantidad;document.getElementById('precio').value=p.precio_unitario;document.getElementById('estado-form').value=p.estado;document.getElementById('btn-submit-text').textContent='Guardar Cambios';document.getElementById('btn-submit-icon').textContent='✎';document.getElementById('btn-cancel-edit').style.display='block';
}

function cancelEdit(){
resetForm();
}

function resetForm(){
editando=null;['cliente','plato','cantidad','precio'].forEach(id=>document.getElementById(id).value='');document.getElementById('estado-form').value='pendiente';
}

function validarForm(){
return true;
}