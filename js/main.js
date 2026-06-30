// Main JavaScript for Customer-Facing Pages

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Load Settings
    loadSettings();
    
    // Load Services based on page
    if (document.getElementById('services-preview')) {
        loadServicesPreview();
    }
    if (document.getElementById('services-grid')) {
        loadServicesPage();
    }
    
    // Load Gallery based on page
    if (document.getElementById('gallery-preview')) {
        loadGalleryPreview();
    }
    if (document.getElementById('gallery-grid')) {
        loadGalleryPage();
    }

    // Lightbox
    setupLightbox();
});

// Load Business Settings
async function loadSettings() {
    try {
        const { data, error } = await supabaseClient
            .from('settings')
            .select('*')
            .single();
        
        if (error || !data) return;
        
        // Update all setting elements
        const elements = {
            'business-name': data.business_name,
            'footer-name': data.business_name,
            'business-address': data.address,
            'contact-address': data.address,
            'business-phone': data.phone,
            'contact-phone': data.phone,
            'booking-phone': data.phone,
            'business-email': data.email,
            'contact-email': data.email,
            'about-text': data.about_text
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el && value) el.textContent = value;
        }
        
        // Update about image if exists
        const aboutImg = document.getElementById('about-image');
        if (aboutImg && data.hero_image) {
            aboutImg.src = data.hero_image;
        }
        
        // Update all business name classes
        document.querySelectorAll('.business-name').forEach(el => {
            if (data.business_name) el.textContent = data.business_name;
        });
        
    } catch (err) {
        console.error('Error loading settings:', err);
    }
}

// Load Services Preview (Homepage)
async function loadServicesPreview() {
    const container = document.getElementById('services-preview');
    if (!container) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('services')
            .select('*')
            .eq('active', true)
            .order('display_order', { ascending: true })
            .limit(3);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="loading">No services available</div>';
            return;
        }
        
        container.innerHTML = data.map(service => createServiceCard(service)).join('');
    } catch (err) {
        container.innerHTML = '<div class="loading">Error loading services</div>';
        console.error(err);
    }
}

// Load Services Page
async function loadServicesPage() {
    const container = document.getElementById('services-grid');
    if (!container) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('services')
            .select('*')
            .eq('active', true)
            .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="loading">No services available</div>';
            return;
        }
        
        container.innerHTML = data.map(service => createServiceCard(service)).join('');
        
        // Setup filter buttons
        setupServiceFilters(data);
    } catch (err) {
        container.innerHTML = '<div class="loading">Error loading services</div>';
        console.error(err);
    }
}

function createServiceCard(service) {
    const image = service.image_url || 'https://via.placeholder.com/400x300?text=No+Image';
    return `
        <div class="service-card" data-category="${service.category}">
            <div class="service-image">
                <img src="${image}" alt="${service.name}" loading="lazy">
            </div>
            <div class="service-content">
                <h3>${service.name}</h3>
                <p>${service.description || ''}</p>
                <div class="service-meta">
                    <span class="service-price">$${service.price}</span>
                    <span class="service-duration"><i class="far fa-clock"></i> ${service.duration || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

function setupServiceFilters(services) {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.service-card');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Load Gallery Preview (Homepage)
async function loadGalleryPreview() {
    const container = document.getElementById('gallery-preview');
    if (!container) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="loading">No photos yet</div>';
            return;
        }
        
        container.innerHTML = data.map(photo => createGalleryItem(photo)).join('');
    } catch (err) {
        container.innerHTML = '<div class="loading">Error loading gallery</div>';
        console.error(err);
    }
}

// Load Gallery Page
async function loadGalleryPage() {
    const container = document.getElementById('gallery-grid');
    if (!container) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="loading">No photos yet</div>';
            return;
        }
        
        container.innerHTML = data.map(photo => createGalleryItem(photo)).join('');
        setupLightbox();
    } catch (err) {
        container.innerHTML = '<div class="loading">Error loading gallery</div>';
        console.error(err);
    }
}

function createGalleryItem(photo) {
    return `
        <div class="gallery-item" data-src="${photo.image_url}" data-title="${photo.title || ''}">
            <img src="${photo.image_url}" alt="${photo.title || 'Gallery photo'}" loading="lazy">
            <div class="gallery-overlay">
                <i class="fas fa-search-plus"></i>
            </div>
        </div>
    `;
}

// Lightbox
function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    
    if (!lightbox) return;
    
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            lightboxImg.src = item.dataset.src;
            lightboxCaption.textContent = item.dataset.title || '';
            lightbox.classList.add('active');
        });
    });
    
    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
    }
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });
}