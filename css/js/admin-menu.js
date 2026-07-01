// ============================================
// LICKING FINGERS - ADMIN MENU MANAGER
// ============================================

let menuItems = [];
let editingItemId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadMenuItems();
    
    const menuForm = document.getElementById('menuForm');
    if (menuForm) {
        menuForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveMenuItem();
        });
    }
});

async function loadMenuItems() {
    const container = document.getElementById('menuList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading menu items...</div>';
    
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });
        
        if (error) throw error;
        menuItems = data || [];
        renderMenuItems();
    } catch (err) {
        console.error('Error loading menu:', err);
        container.innerHTML = '<div class="loading" style="color: #c62828;">Failed to load menu items.</div>';
    }
}

function renderMenuItems() {
    const container = document.getElementById('menuList');
    if (!container) return;
    
    if (menuItems.length === 0) {
        container.innerHTML = '<div class="loading">No menu items yet. Add your first dish!</div>';
        return;
    }
    
    container.innerHTML = menuItems.map(item => {
        const imageUrl = item.image_path 
            ? (item.image_path.startsWith('http') ? item.image_path : supabase.storage.from('menu-images').getPublicUrl(item.image_path).data.publicUrl)
            : 'assets/placeholder-food.jpg';
        
        return `
            <div class="menu-admin-card" data-id="${item.id}">
                <div class="menu-admin-img">
                    <img src="${imageUrl}" alt="${item.name}" onerror="this.src='assets/placeholder-food.jpg'">
                </div>
                <div class="menu-admin-info">
                    <div class="menu-admin-header">
                        <h4>${item.name}</h4>
                        <span class="menu-admin-price">$${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    <p class="menu-admin-desc">${item.description || ''}</p>
                    <div class="menu-admin-meta">
                        <span class="menu-admin-category">${item.category || 'Uncategorized'}</span>
                        <span class="menu-admin-status ${item.available ? 'available' : 'unavailable'}">
                            ${item.available ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                </div>
                <div class="menu-admin-actions">
                    <button class="btn-icon" onclick="editMenuItem(${item.id})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-danger" onclick="deleteMenuItem(${item.id})" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

async function saveMenuItem() {
    const btn = document.querySelector('#menuForm button[type="submit"]');
    const name = document.getElementById('itemName')?.value.trim();
    const description = document.getElementById('itemDesc')?.value.trim();
    const price = document.getElementById('itemPrice')?.value;
    const category = document.getElementById('itemCategory')?.value;
    const available = document.getElementById('itemAvailable')?.checked ?? true;
    const fileInput = document.getElementById('itemImage');
    
    if (!name || !price) {
        showToast('Name and price are required!', 'error');
        return;
    }
    
    showLoading(btn, true);
    
    try {
        let imagePath = editingItemId ? menuItems.find(i => i.id === editingItemId)?.image_path : null;
        
        // Upload new image if provided
        if (fileInput?.files?.length) {
            const file = fileInput.files[0];
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Only JPG, PNG, and WEBP images are allowed!');
            }
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `menu/${fileName}`;
            
            const { error: uploadError } = await supabase
                .storage
                .from('menu-images')
                .upload(filePath, file, { contentType: file.type });
            
            if (uploadError) throw uploadError;
            imagePath = filePath;
        }
        
        const itemData = {
            name,
            description,
            price: parseFloat(price),
            category: category || 'Main',
            available,
            image_path: imagePath,
            updated_at: new Date().toISOString()
        };
        
        if (editingItemId) {
            const { error } = await supabase
                .from('menu_items')
                .update(itemData)
                .eq('id', editingItemId);
            if (error) throw error;
            showToast('Menu item updated!', 'success');
        } else {
            itemData.created_at = new Date().toISOString();
            const { error } = await supabase.from('menu_items').insert([itemData]);
            if (error) throw error;
            showToast('Menu item added!', 'success');
        }
        
        resetForm();
        await loadMenuItems();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
        console.error(err);
    } finally {
        showLoading(btn, false, editingItemId ? 'Update Item' : 'Add Item');
    }
}

function editMenuItem(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    
    editingItemId = id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemDesc').value = item.description || '';
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemCategory').value = item.category || 'Main';
    document.getElementById('itemAvailable').checked = item.available !== false;
    document.getElementById('formTitle').textContent = 'Edit Menu Item';
    
    const preview = document.getElementById('imagePreview');
    if (preview && item.image_path) {
        const url = item.image_path.startsWith('http') 
            ? item.image_path 
            : supabase.storage.from('menu-images').getPublicUrl(item.image_path).data.publicUrl;
        preview.src = url;
        preview.style.display = 'block';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
        const { error } = await supabase.from('menu_items').delete().eq('id', id);
        if (error) throw error;
        showToast('Menu item deleted!', 'success');
        await loadMenuItems();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

function resetForm() {
    editingItemId = null;
    document.getElementById('menuForm')?.reset();
    document.getElementById('formTitle').textContent = 'Add New Item';
    const preview = document.getElementById('imagePreview');
    if (preview) preview.style.display = 'none';
}

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
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