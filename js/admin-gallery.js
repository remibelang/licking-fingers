// Admin Gallery Management

document.addEventListener('DOMContentLoaded', function() {
    loadAdminGallery();
    setupGalleryForm();
    setupFilePreview();
});

function setupGalleryForm() {
    const form = document.getElementById('gallery-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('gallery-file');
        const title = document.getElementById('gallery-title').value;
        const category = document.getElementById('gallery-category').value;
        
        if (!fileInput.files || fileInput.files.length === 0) {
            showMessage('gallery-message', 'Please select an image to upload', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabaseClient
                .storage
                .from('gallery-1')
                .upload(fileName, file);
            
            if (uploadError) throw uploadError;
            
            // Get public URL
            const { data: { publicUrl } } = supabaseClient
                .storage
                .from('gallery-1')
                .getPublicUrl(fileName);
            
            // Save to database
            const { error: dbError } = await supabaseClient
                .from('gallery')
                .insert([{
                    title: title,
                    category: category,
                    image_url: publicUrl
                }]);
            
            if (dbError) throw dbError;
            
            showMessage('gallery-message', 'Photo uploaded successfully!', 'success');
            form.reset();
            document.getElementById('upload-preview').innerHTML = '';
            loadAdminGallery();
            
        } catch (err) {
            showMessage('gallery-message', 'Error uploading: ' + err.message, 'error');
            console.error(err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-upload"></i> Upload to Gallery';
        }
    });
}

function setupFilePreview() {
    const fileInput = document.getElementById('gallery-file');
    const preview = document.getElementById('upload-preview');
    
    if (!fileInput || !preview) return;
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
    });
}

async function loadAdminGallery() {
    const container = document.getElementById('admin-gallery-grid');
    if (!container) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="loading">No photos uploaded yet</div>';
            return;
        }
        
        container.innerHTML = data.map(photo => `
            <div class="admin-gallery-item">
                <img src="${photo.image_url}" alt="${photo.title || ''}">
                <div class="admin-gallery-overlay">
                    <button class="btn btn-sm btn-danger" onclick="deletePhoto('${photo.id}', '${photo.image_url}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        container.innerHTML = '<div class="loading">Error loading gallery</div>';
        console.error(err);
    }
}

async function deletePhoto(id, imageUrl) {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
        // Delete from database
        const { error: dbError } = await supabaseClient
            .from('gallery')
            .delete()
            .eq('id', id);
        
        if (dbError) throw dbError;
        
        // Extract filename from URL and delete from storage
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        if (fileName) {
            await supabaseClient
                .storage
                .from('gallery-1')
                .remove([fileName]);
        }
        
        loadAdminGallery();
        showMessage('gallery-message', 'Photo deleted successfully!', 'success');
        
    } catch (err) {
        showMessage('gallery-message', 'Error deleting photo: ' + err.message, 'error');
        console.error(err);
    }
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