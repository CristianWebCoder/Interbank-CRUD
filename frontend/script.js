// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Variables globales
let transferencias = [];
let editingId = null;

// Elementos del DOM
const elements = {
    tbody: document.getElementById('transferencias-tbody'),
    loading: document.getElementById('loading'),
    noData: document.getElementById('no-data'),
    modal: document.getElementById('transferencia-modal'),
    confirmModal: document.getElementById('confirm-modal'),
    form: document.getElementById('transferencia-form'),
    modalTitle: document.getElementById('modal-title'),
    toastContainer: document.getElementById('toast-container')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadTransferencias();
    loadEstadisticas();
});

// Funciones principales

async function loadTransferencias() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/transferencias`);
        const result = await response.json();
        
        if (response.ok) {
            transferencias = result.data;
            renderTransferencias(transferencias);
            showToast('success', 'Datos cargados', 'Transferencias actualizadas correctamente');
        } else {
            throw new Error(result.error || 'Error al cargar transferencias');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', 'No se pudieron cargar las transferencias');
        renderTransferencias([]);
    } finally {
        showLoading(false);
    }
}

async function loadEstadisticas() {
    try {
        const response = await fetch(`${API_BASE_URL}/estadisticas`);
        const result = await response.json();
        
        if (response.ok) {
            updateEstadisticas(result.data);
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function renderTransferencias(data) {
    if (data.length === 0) {
        elements.tbody.innerHTML = '';
        showNoData(true);
        return;
    }

    showNoData(false);
    
    elements.tbody.innerHTML = data.map(transferencia => `
        <tr>
            <td>${transferencia.id}</td>
            <td><strong>S/ ${parseFloat(transferencia.monto).toFixed(2)}</strong></td>
            <td>${transferencia.cuenta_origen}</td>
            <td>${transferencia.cuenta_destino}</td>
            <td>${transferencia.descripcion || '-'}</td>
            <td><span class="tipo-badge tipo-${transferencia.tipo}">${transferencia.tipo}</span></td>
            <td><span class="estado-badge estado-${transferencia.estado}">${transferencia.estado}</span></td>
            <td>${formatDate(transferencia.fecha_creacion)}</td>
            <td class="acciones">
                <button class="btn btn-sm btn-secondary" onclick="editTransferencia(${transferencia.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDelete(${transferencia.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateEstadisticas(stats) {
    document.getElementById('total-transferencias').textContent = stats.total_transferencias || 0;
    document.getElementById('monto-total').textContent = `S/ ${parseFloat(stats.monto_total || 0).toFixed(2)}`;
    document.getElementById('transferencias-completadas').textContent = stats.transferencias_completadas || 0;
    document.getElementById('transferencias-pendientes').textContent = stats.transferencias_pendientes || 0;
}

// Funciones de filtrado
function filterTransferencias() {
    const estadoFilter = document.getElementById('filter-estado').value;
    const tipoFilter = document.getElementById('filter-tipo').value;
    const searchFilter = document.getElementById('search-input').value.toLowerCase();

    const filtered = transferencias.filter(transferencia => {
        const matchEstado = !estadoFilter || transferencia.estado === estadoFilter;
        const matchTipo = !tipoFilter || transferencia.tipo === tipoFilter;
        const matchSearch = !searchFilter || 
            transferencia.descripcion?.toLowerCase().includes(searchFilter) ||
            transferencia.cuenta_origen.toLowerCase().includes(searchFilter) ||
            transferencia.cuenta_destino.toLowerCase().includes(searchFilter);

        return matchEstado && matchTipo && matchSearch;
    });

    renderTransferencias(filtered);
}

// Funciones del modal
function openModal(id = null) {
    editingId = id;
    const transferencia = id ? transferencias.find(t => t.id === id) : null;
    
    elements.modalTitle.textContent = transferencia ? 'Editar Transferencia' : 'Nueva Transferencia';
    
    if (transferencia) {
        fillForm(transferencia);
    } else {
        elements.form.reset();
    }
    
    elements.modal.classList.remove('hidden');
}

function closeModal() {
    elements.modal.classList.add('hidden');
    elements.form.reset();
    editingId = null;
}

function fillForm(transferencia) {
    document.getElementById('monto').value = transferencia.monto;
    document.getElementById('cuenta-origen').value = transferencia.cuenta_origen;
    document.getElementById('cuenta-destino').value = transferencia.cuenta_destino;
    document.getElementById('descripcion').value = transferencia.descripcion || '';
    document.getElementById('tipo').value = transferencia.tipo;
    document.getElementById('estado').value = transferencia.estado;
}

async function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(elements.form);
    const data = {
        monto: parseFloat(formData.get('monto')),
        cuenta_origen: formData.get('cuenta_origen'),
        cuenta_destino: formData.get('cuenta_destino'),
        descripcion: formData.get('descripcion'),
        tipo: formData.get('tipo'),
        estado: formData.get('estado')
    };

    try {
        const url = editingId 
            ? `${API_BASE_URL}/transferencias/${editingId}`
            : `${API_BASE_URL}/transferencias`;
        
        const method = editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('success', 'Éxito', result.message);
            closeModal();
            await loadTransferencias();
            await loadEstadisticas();
        } else {
            throw new Error(result.error || 'Error al guardar');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', error.message);
    }
}

// Funciones de edición y eliminación
function editTransferencia(id) {
    openModal(id);
}

function confirmDelete(id) {
    const transferencia = transferencias.find(t => t.id === id);
    const message = `¿Estás seguro de que deseas eliminar la transferencia #${id} por S/ ${transferencia.monto}?`;
    
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-btn').onclick = () => deleteTransferencia(id);
    
    elements.confirmModal.classList.remove('hidden');
}

function closeConfirmModal() {
    elements.confirmModal.classList.add('hidden');
}

async function deleteTransferencia(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/transferencias/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showToast('success', 'Eliminado', result.message);
            closeConfirmModal();
            await loadTransferencias();
            await loadEstadisticas();
        } else {
            throw new Error(result.error || 'Error al eliminar');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', error.message);
    }
}

// Funciones de utilidad
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoading(show) {
    elements.loading.classList.toggle('hidden', !show);
    elements.tbody.style.display = show ? 'none' : 'table-row-group';
}

function showNoData(show) {
    elements.noData.classList.toggle('hidden', !show);
}

function refreshData() {
    loadTransferencias();
    loadEstadisticas();
}

// Sistema de notificaciones Toast
function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-circle' : 
                 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Event listeners adicionales
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
        closeConfirmModal();
    }
});

// Cerrar modales al hacer clic fuera
elements.modal.addEventListener('click', (event) => {
    if (event.target === elements.modal) {
        closeModal();
    }
});

elements.confirmModal.addEventListener('click', (event) => {
    if (event.target === elements.confirmModal) {
        closeConfirmModal();
    }
});

// Función global para refrescar datos
window.refreshData = refreshData;
window.openModal = openModal;
window.closeModal = closeModal;
window.editTransferencia = editTransferencia;
window.confirmDelete = confirmDelete;
window.closeConfirmModal = closeConfirmModal;
window.filterTransferencias = filterTransferencias; 