// ============================================
// LICKING FINGERS - ADMIN GALLERY MANAGER
// ============================================

let galleryImages = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadGallery();
    
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await uploadImage();
        });
    }
});

async function loadGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    
    grid.innerHTML = '<div class="loading" style="grid-column: 1/-1;"><div class="spinner"></div> Loading gallery...</div>';
    
    try {
        // Load from storage bucket
        const { data: files, error: storageError } = await supabase
            .storage
            .from('gallery')
            .list();
        
        if (storageError) throw storageError;
        
        // Also load metadata from table
        const { data: meta, error: metaError } = await supabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (metaError) throw metaError;
        
        galleryImages = meta || [];
        renderGallery(files || []);
    } catch (err) {
        console.error('Error loading gallery:', err);
        const grid = document.getElementById('galleryGrid');
        if (grid) grid.innerHTML = '<div class="loading" style="grid-column: 1/-1; color: #c62828;">Failed to load gallery.</div>';
    }
}

function renderGallery(files) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    
    if (galleryImages.length === 0) {
        grid.innerHTML = '<div class="loading" style="grid-column: 1/-1;">No images in gallery yet.</div>';
        return;
    }
    
    grid.innerHTML = galleryImages.map(img => {
        const publicUrl = supabase.storage.from('gallery').getPublicUrl(img.storage_path).data.publicUrl;
        return `
            <div class="gallery-admin-card">
                <div class="gallery-img-wrapper">
                    <img src="${publicUrl}" alt="${img.caption || ''}" loading="lazy">
                </div>
                <div class="gallery-card-info">
                    <p class="gallery-caption">${img.caption || 'No caption'}</p>
                    <small class="gallery-date">${new Date(img.created_at).toLocaleDateString()}</small>
                </div>
                <div class="gallery-card-actions">
                    <button class="btn-icon" onclick="editCaption(${img.id}, '${(img.caption || '').replace(/'/g, "\\'")}')" title="Edit Caption">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteImage(${img.id}, '${img.storage_path}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function uploadImage() {
    const fileInput = document.getElementById('galleryFile');
    const captionInput = document.getElementById('galleryCaption');
    const categoryInput = document.getElementById('galleryCategory');
    const btn = document.querySelector('#uploadForm button[type="submit"]');
    
    if (!fileInput?.files?.length) {
        showToast('Please select an image!', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        showToast('Only JPG, PNG, and WEBP images are allowed!', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be smaller than 5MB!', 'error');
        return;
    }
    
    showLoading(btn, true);
    
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `gallery/${fileName}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase
            .storage
            .from('gallery')
            .upload(filePath, file, { contentType: file.type });
        
        if (uploadError) throw uploadError;
        
        // Save metadata
        const { error: dbError } = await supabase.from('gallery').insert([{
            storage_path: filePath,
            caption: captionInput?.value || '',
            category: categoryInput?.value || 'general',
            created_at: new Date().toISOString()
        }]);
        
        if (dbError) throw dbError;
        
        showToast('Image uploaded successfully!', 'success');
        document.getElementById('uploadForm').reset();
        document.getElementById('previewImage').style.display = 'none';
        await loadGallery();
    } catch (err) {
        showToast('Upload failed: ' + err.message, 'error');
        console.error(err);
    } finally {
        showLoading(btn, false, '<i class="fas fa-cloud-upload-alt"></i> Upload Image');
    }
}

// Preview image before upload
function previewGalleryImage(input) {
    const preview = document.getElementById('previewImage');
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

async function editCaption(id, currentCaption) {
    const newCaption = prompt('Enter new caption:', currentCaption);
    if (newCaption === null) return;
    
    try {
        const { error } = await supabase
            .from('gallery')
            .update({ caption: newCaption })
            .eq('id', id);
        
        if (error) throw error;
        showToast('Caption updated!', 'success');
        await loadGallery();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

async function deleteImage(id, storagePath) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
        // Delete from storage
        const { error: storageError } = await supabase
            .storage
            .from('gallery')
            .remove([storagePath]);
        
        if (storageError) console.warn('Storage delete warning:', storageError);
        
        // Delete from database
        const { error: dbError } = await supabase
            .from('gallery')
            .delete()
            .eq('id', id);
        
        if (dbError) throw dbError;
        
        showToast('Image deleted!', 'success');
        await loadGallery();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

function showLoading(btn, loading, text) {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading ? '<i class="fas fa-spinner fa-spin"></i> Uploading...' : text;
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