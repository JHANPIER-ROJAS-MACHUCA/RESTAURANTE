import { API_BASE } from './config.js';

async function apiFetch(endpoint, options = {}) {

    const token = localStorage.getItem('accessToken');

    const config = {

        ...options,

        headers: {

            'Content-Type': 'application/json',

            ...(token && {
                Authorization: `Bearer ${token}`
            }),

            ...options.headers
        }

    };

    const response = await fetch(
        `${API_BASE}${endpoint}`,
        config
    );

    if (response.status === 401) {

        localStorage.clear();

        window.location.replace(
            'login.html'
        );

        return null;
    }

    return response;
}


async function cargarPedidos() {

    try {

        const res = await apiFetch(
            '/pedidos'
        );

        if (!res) return;

        if (!res.ok)
            throw new Error(
                `HTTP ${res.status}`
            );

        const response = await res.json();
        pedidos = response.data || [];

        renderTabla();

        updateStats();

    } catch (e) {

        console.error(e);

        showToast(
            e.message,
            'error'
        );

    }

}


async function confirmarDelete() {

    closeModal(
        'modal-delete'
    );

    try {

        const res = await apiFetch(
            `/pedidos/${deleteTarget}`,
            {
                method:'DELETE'
            }
        );

        if (!res || !res.ok) {
            const error = await res?.json();
            throw new Error(error?.error || 'Error al eliminar');
        }

        pedidos = pedidos.filter(
            p=>p.id!==deleteTarget
        );

        renderTabla();

        updateStats();

        showToast('Pedido eliminado','success');

    } catch(e){

        console.error(e);

        showToast(e.message,'error');

    }

}


async function confirmarEstado(){

    closeModal(
        'modal-estado'
    );

    try{

        const res = await apiFetch(
            `/pedidos/${estadoTarget}`,
            {
                method:'PUT',

                body:JSON.stringify({

                    estado:nuevoEstado

                })
            }
        );

        if (!res || !res.ok) {
            const error = await res?.json();
            throw new Error(error?.error || 'Error al actualizar estado');
        }

        const p=pedidos.find(
            x=>x.id===estadoTarget
        );

        p.estado=nuevoEstado;

        renderTabla();

        updateStats();

        showToast('Estado actualizado','success');

    }catch(e){

        console.error(e);

        showToast(e.message,'error');

    }

}