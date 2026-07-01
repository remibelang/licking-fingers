// ============================================
// SUPABASE CONFIGURATION - Licking Fingers
// ============================================

const SUPABASE_URL = 'https://wbbsxfoztegjokbnsemq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiYnN4Zm96dGVnam9rYm5zZW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2ODk0MzAsImV4cCI6MjA1MTI2NTQzMH0.utWMF5ctdmY5ENFan1Bkmg_4CKIz8Q1';

// Initialize Supabase client after DOM is ready
function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized');
        return true;
    }
    return false;
}

// Try immediately
if (!initSupabase()) {
    // Retry after library loads
    window.addEventListener('load', () => {
        setTimeout(initSupabase, 300);
    });
}