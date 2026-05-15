import { API_BASE } from './config.js';

// Importar los demás módulos como side-effects
// (sus funciones estarán disponibles globalmente)
import './guard.js';
import './state.js';
import './utils.js';
import './toast.js';
import './modal.js';
import './api.js';
import './pedidos.js';
import './ui.js';

// Inicializar cuando el DOM esté listo
document.addEventListener(
'DOMContentLoaded',
()=>{
cargarPedidos();
}
);