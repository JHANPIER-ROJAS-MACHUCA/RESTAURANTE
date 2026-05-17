export let pedidos = [];
export let filtroActual = 'todos';
export let editando = null;
export let deleteTarget = null;
export let estadoTarget = null;
export let nuevoEstado = null;

export function setPedidos(v)      { pedidos      = v; }
export function setFiltroActual(v) { filtroActual = v; }
export function setEditando(v)     { editando     = v; }
export function setDeleteTarget(v) { deleteTarget = v; }
export function setEstadoTarget(v) { estadoTarget = v; }
export function setNuevoEstado(v)  { nuevoEstado  = v; }