// Check authentication
if (!localStorage.getItem('adminToken')) {
    window.location.href = 'admin-login.html';
}

let editingItemId = null;

// Load menu items
async function loadMenuItems() {
    try {
        const response = await fetch('http://localhost:5000/api/menu');
        const data = await response.json();
        
        const container = document.getElementById('menu-items-container');
        container.innerHTML = '';
        
        data.items.forEach(item => {
            const card = createMenuItemCard(item);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

function createMenuItemCard(item) {
    const div = document.createElement('div');
    div.className = 'menu-item-card';
    div.innerHTML = `
        <img src=".${item.image_path || 'assets/images/placeholder.jpg'}" alt="${item.name}" class="menu-item-image">
        <div class="menu-item-info">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="menu-item-meta">
                <span class="price">$${item.price}</span>
                <span class="availability ${item.available ? 'available' : 'unavailable'}">
                    <i class="fas fa-${item.available ? 'check' : 'times'}-circle"></i>
                    ${item.available ? 'Available' : 'Unavailable'}
                </span>
            </div>
        </div>
        <div class="menu-item-actions">
            <button class="btn-edit" onclick="editItem(${item.id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete" onclick="deleteItem(${item.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return div;
}

// Modal Functions
function openAddModal() {
    editingItemId = null;
    document.getElementById('modal-title').textContent = 'Add New Menu Item';
    document.getElementById('menu-form').reset();
    document.getElementById('image-preview').innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <span>Click to upload image</span>
    `;
    document.getElementById('menu-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('menu-modal').classList.remove('active');
}

// Image Preview
function previewImage(input) {
    const preview = document.getElementById('image-preview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Edit Item
async function editItem(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/menu/${id}`);
        const data = await response.json();
        const item = data.item;
        
        editingItemId = id;
        document.getElementById('modal-title').textContent = 'Edit Menu Item';
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-description').value = item.description;
        document.getElementById('item-available').checked = item.available;
        
        if (item.image_path) {
            document.getElementById('image-preview').innerHTML = 
                `<img src=".${item.image_path}" alt="${item.name}">`;
        }
        
        document.getElementById('menu-modal').classList.add('active');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Delete Item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            loadMenuItems();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Form Submit
document.getElementById('menu-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('item-name').value);
    formData.append('price', document.getElementById('item-price').value);
    formData.append('category', document.getElementById('item-category').value);
    formData.append('description', document.getElementById('item-description').value);
    formData.append('available', document.getElementById('item-available').checked);
    
    const imageFile = document.getElementById('item-image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const url = editingItemId 
            ? `http://localhost:5000/api/menu/${editingItemId}`
            : 'http://localhost:5000/api/menu';
            
        const method = editingItemId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });
        
        if (response.ok) {
            closeModal();
            loadMenuItems();
        } else {
            alert('Failed to save item');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadMenuItems);