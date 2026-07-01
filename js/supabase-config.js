// ============================================
// SUPABASE CONFIG - LICKING FINGERS
// ============================================

const SUPABASE_URL = 'https://wbbsxfoztegjokbnsemq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_utWMF5ctdmY5ENFan1Bkmg_4CKIz8Q1';

// Initialize Supabase client
let supabaseClient;

function initSupabase() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase connected');
        document.dispatchEvent(new Event('supabase-ready'));
    } else {
        console.error('❌ Supabase library not loaded');
    }
}

// Generate order code (e.g., LF-ABC123-DEF456)
function generateOrderCode() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return 'LF-' + timestamp + '-' + random;
}

// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

// Show toast notification
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-' + type;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'error' ? '#ff4444' : '#00ff88'};
        color: ${type === 'error' ? '#fff' : '#1a1a2e'};
        padding: 1rem 2rem;
        border-radius: 12px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        transform: translateX(500px);
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        z-index: 2000;
        font-weight: 600;
        font-family: 'Poppins', sans-serif;
    `;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => toast.style.transform = 'translateX(0)');
    setTimeout(() => {
        toast.style.transform = 'translateX(500px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}