// Admin Services Management

let editingServiceId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadServicesTable();
    setupServiceForm();
});

function setupServiceForm() {
    const form = document.getElementById('service-form');
    const cancelBtn = document.getElementById('service-cancel');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const serviceData = {
            name: document.getElementById('service-name').value,
            category: document.getElementById('service-category').value,
            price: parseFloat(document.getElementById('service-price').value),
            duration: document.getElementById('service-duration').value,
            description: document.getElementById('service-description').value,
            image_url: document.getElementById('service-image').value,
            active: true
        };
        
        try {
            let result;
            
            if (editingServiceId) {
                result = await supabaseClient
                    .from('services')
                    .update(serviceData)
                    .eq('id', editingServiceId);
            } else {
                result = await supabaseClient
                    .from('services')
                    .insert([serviceData]);
            }
            
            if (result.error) throw result.error;
            
            showMessage('service-message', 'Service saved successfully!', 'success');
            resetForm();
            loadServicesTable();
            
        } catch (err) {
            showMessage('service-message', 'Error saving service: ' + err.message, 'error');
            console.error(err);
        }
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
    }
}

async function loadServicesTable() {
    const tbody = document.getElementById('services-table');
    if (!tbody) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('services')
            .select('*')
            .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No services added yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(service => `
            <tr>
                <td><img src="${service.image_url || 'https://via.placeholder.com/60'}" alt=""></td>
                <td>${service.name}</td>
                <td>${service.category}</td>
                <td>$${service.price}</td>
                <td>${service.duration || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-icon" onclick="editService('${service.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-icon btn-danger" onclick="deleteService('${service.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading services</td></tr>';
        console.error(err);
    }
}

async function editService(id) {
    try {
        const { data, error } = await supabaseClient
            .from('services')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        document.getElementById('service-id').value = data.id;
        document.getElementById('service-name').value = data.name;
        document.getElementById('service-category').value = data.category;
        document.getElementById('service-price').value = data.price;
        document.getElementById('service-duration').value = data.duration || '';
        document.getElementById('service-description').value = data.description || '';
        document.getElementById('service-image').value = data.image_url || '';
        
        editingServiceId = data.id;
        
        document.getElementById('service-submit').innerHTML = '<i class="fas fa-save"></i> Update Service';
        document.getElementById('service-cancel').style.display = 'inline-flex';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (err) {
        console.error('Error loading service:', err);
    }
}

async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('services')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        loadServicesTable();
        showMessage('service-message', 'Service deleted successfully!', 'success');
        
    } catch (err) {
        showMessage('service-message', 'Error deleting service: ' + err.message, 'error');
        console.error(err);
    }
}

function resetForm() {
    document.getElementById('service-form').reset();
    document.getElementById('service-id').value = '';
    editingServiceId = null;
    document.getElementById('service-submit').innerHTML = '<i class="fas fa-save"></i> Save Service';
    document.getElementById('service-cancel').style.display = 'none';
}

function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    if (el) {
        el.className = `message ${type}`;
        el.textContent = text;
        setTimeout(() => {
            el.className = 'message';
            el.textContent = '';
        }, 5000);
    }
}