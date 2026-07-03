// ============================================
// SUPABASE CONFIGURATION - Licking Fingers
// New Project: hejqkxwtdpbguymshxmq
// ============================================

const SUPABASE_URL = 'https://hejqkxwtdpbguymshxmq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CKoBtZ4r3Bqkr8mOfOyTig_Q58ZS_YO';

// Initialize Supabase client
function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized for Licking Fingers');
        return true;
    }
    return false;
}

if (!initSupabase()) {
    window.addEventListener('load', () => {
        setTimeout(initSupabase, 300);
    });
}