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
        `${API}${endpoint}`,
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

        pedidos = await res.json();

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

        await apiFetch(
            `/pedidos/${deleteTarget}`,
            {
                method:'DELETE'
            }
        );

        pedidos = pedidos.filter(
            p=>p.id!==deleteTarget
        );

        renderTabla();

        updateStats();

    } catch(e){

        console.error(e);

    }

}


async function confirmarEstado(){

    closeModal(
        'modal-estado'
    );

    try{

        await apiFetch(
            `/pedidos/${estadoTarget}`,
            {
                method:'PUT',

                body:JSON.stringify({

                    estado:nuevoEstado

                })
            }
        );

        const p=pedidos.find(
            x=>x.id===estadoTarget
        );

        p.estado=nuevoEstado;

        renderTabla();

        updateStats();

    }catch(e){

        console.error(e);

    }

}