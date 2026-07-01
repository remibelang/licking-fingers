// ============================================
// LICKING FINGERS - ADMIN SERVICES MANAGER
// ============================================

let services = [];
let editingServiceId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadServices();
    
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveService();
        });
    }
});

async function loadServices() {
    const container = document.getElementById('servicesList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading services...</div>';
    
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        services = data || [];
        renderServices();
    } catch (err) {
        console.error('Error loading services:', err);
        container.innerHTML = '<div class="loading" style="color: #c62828;">Failed to load services.</div>';
    }
}

function renderServices() {
    const container = document.getElementById('servicesList');
    if (!container) return;
    
    if (services.length === 0) {
        container.innerHTML = '<div class="loading">No services added yet.</div>';
        return;
    }
    
    container.innerHTML = services.map(s => `
        <div class="service-row" data-id="${s.id}">
            <div class="service-info">
                <div class="service-icon-display" style="background: ${s.color || '#8B4513'}20; color: ${s.color || '#8B4513'};">
                    <i class="fas ${s.icon || 'fa-concierge-bell'}"></i>
                </div>
                <div>
                    <h4>${s.name}</h4>
                    <p>${s.description || ''}</p>
                    <small>${s.price ? '$' + parseFloat(s.price).toFixed(2) : 'Price varies'}</small>
                </div>
            </div>
            <div class="service-actions">
                <button class="btn-icon" onclick="editService(${s.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-danger" onclick="deleteService(${s.id})" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

async function saveService() {
    const btn = document.querySelector('#serviceForm button[type="submit"]');
    const name = document.getElementById('serviceName')?.value.trim();
    const description = document.getElementById('serviceDesc')?.value.trim();
    const price = document.getElementById('servicePrice')?.value;
    const icon = document.getElementById('serviceIcon')?.value;
    const color = document.getElementById('serviceColor')?.value;
    
    if (!name) {
        showToast('Service name is required!', 'error');
        return;
    }
    
    showLoading(btn, true);
    
    try {
        const serviceData = {
            name,
            description,
            price: price ? parseFloat(price) : null,
            icon: icon || 'fa-concierge-bell',
            color: color || '#8B4513',
            sort_order: services.length + 1,
            updated_at: new Date().toISOString()
        };
        
        if (editingServiceId) {
            const { error } = await supabase
                .from('services')
                .update(serviceData)
                .eq('id', editingServiceId);
            if (error) throw error;
            showToast('Service updated!', 'success');
        } else {
            serviceData.created_at = new Date().toISOString();
            const { error } = await supabase.from('services').insert([serviceData]);
            if (error) throw error;
            showToast('Service added!', 'success');
        }
        
        document.getElementById('serviceForm').reset();
        editingServiceId = null;
        document.getElementById('formTitle').textContent = 'Add New Service';
        await loadServices();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        showLoading(btn, false, editingServiceId ? 'Update Service' : 'Add Service');
    }
}

function editService(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    editingServiceId = id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceDesc').value = service.description || '';
    document.getElementById('servicePrice').value = service.price || '';
    document.getElementById('serviceIcon').value = service.icon || 'fa-concierge-bell';
    document.getElementById('serviceColor').value = service.color || '#8B4513';
    document.getElementById('formTitle').textContent = 'Edit Service';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;
        showToast('Service deleted!', 'success');
        await loadServices();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

function showLoading(btn, loading, text) {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading ? '<i class="fas fa-spinner fa-spin"></i> Saving...' : text;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 8px;
        color: white; font-weight: 500; z-index: 9999; animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #388E3C;' : 'background: #D32F2F;'}
    `;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) window.location.href = 'admin-login.html';
}