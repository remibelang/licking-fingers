// ============================================
// LICKING FINGERS - MAIN SITE JAVASCRIPT
// ============================================

// Initialize Supabase
const supabaseUrl = 'https://wbbsxfoztegjokbnsemq.supabase.co';
const supabaseKey = 'sb_publishable_utWMF5ctdmY5ENFan1Bkmg_4CKIz8Q1';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ============================================
// MOBILE NAVIGATION
// ============================================
function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        
        // Close menu when clicking a link
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                const icon = toggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
}

// ============================================
// SCROLL EFFECTS
// ============================================
function initScrollEffects() {
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            }
        });
    }
    
    // Scroll reveal animation
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    revealElements.forEach(el => revealObserver.observe(el));
}

// ============================================
// MENU LOADING
// ============================================
async function loadMenuItems(containerId = 'menuContainer', category = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div class="loading" style="grid-column: 1/-1; text-align: center; padding: 40px;"><div class="spinner"></div> Loading menu...</div>';
    
    try {
        let query = supabase.from('menu_items').select('*').eq('available', true).order('name');
        if (category !== 'all') {
            query = query.eq('category', category);
        }
        
        const { data: items, error } = await query;
        if (error) throw error;
        
        if (!items || items.length === 0) {
            container.innerHTML = '<div class="loading" style="grid-column: 1/-1;">No menu items available.</div>';
            return;
        }
        
        container.innerHTML = items.map(item => `
            <div class="menu-card" data-category="${item.category}">
                <div class="menu-image">
                    <img src="${item.image_path || 'assets/placeholder-food.jpg'}" alt="${item.name}" loading="lazy" onerror="this.src='assets/placeholder-food.jpg'">
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id}, '${item.name.replace(/'/g, "\\'")}', ${item.price}, '${(item.image_path || '').replace(/'/g, "\\'")}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="menu-content">
                    <div class="menu-header">
                        <h3>${item.name}</h3>
                        <span class="menu-price">$${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    <p class="menu-desc">${item.description || ''}</p>
                    <div class="menu-meta">
                        <span class="menu-category"><i class="fas fa-tag"></i> ${item.category || 'Main'}</span>
                        <span class="menu-time"><i class="fas fa-clock"></i> 20-35 min</span>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        console.error('Error loading menu:', err);
        container.innerHTML = '<div class="loading" style="grid-column: 1/-1; color: #c62828;">Failed to load menu. Please refresh.</div>';
    }
}

// ============================================
// MENU FILTERING
// ============================================
function initMenuFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuContainer = document.getElementById('menuContainer');
    
    if (!filterBtns.length || !menuContainer) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category || 'all';
            await loadMenuItems('menuContainer', category);
        });
    });
}

// ============================================
// TESTIMONIALS SLIDER
// ============================================
function initTestimonials() {
    const slider = document.getElementById('testimonialSlider');
    if (!slider) return;
    
    let currentSlide = 0;
    const slides = slider.querySelectorAll('.testimonial-slide');
    if (!slides.length) return;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
            slide.style.opacity = i === index ? '1' : '0';
        });
    }
    
    showSlide(0);
    
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000);
}

// ============================================
// NEWSLETTER SUBSCRIPTION
// ============================================
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        const btn = form.querySelector('button');
        const msg = document.getElementById('newsletterMessage');
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        try {
            const { error } = await supabase.from('newsletter_subscribers').insert([{
                email: email,
                subscribed_at: new Date().toISOString()
            }]);
            
            if (error) throw error;
            
            if (msg) {
                msg.textContent = 'Thank you for subscribing!';
                msg.className = 'message success';
            }
            form.reset();
        } catch (err) {
            console.error(err);
            if (msg) {
                msg.textContent = 'Already subscribed or error occurred.';
                msg.className = 'message error';
            }
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Subscribe';
        }
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                window.scrollTo({
                    top: target.offsetTop - navHeight - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// LAZY LOAD IMAGES
// ============================================
function initLazyImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.removeAttribute('loading');
                    imageObserver.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function initSearch() {
    const searchInput = document.getElementById('menuSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.menu-card');
        
        cards.forEach(card => {
            const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('.menu-desc')?.textContent.toLowerCase() || '';
            const category = card.dataset.category?.toLowerCase() || '';
            
            if (name.includes(term) || desc.includes(term) || category.includes(term)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initScrollEffects();
    initMenuFilters();
    initTestimonials();
    initNewsletter();
    initSmoothScroll();
    initLazyImages();
    initSearch();
    
    // Load menu if on homepage
    if (document.getElementById('menuContainer')) {
        loadMenuItems();
    }
    
    // Update cart count
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});