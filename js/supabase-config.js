// Supabase Configuration
const SUPABASE_URL = 'https://wbbsxfoztegjokbnsemq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiYnN4Zm96dGVnam9rYm5zZW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDU0MjcsImV4cCI6MjA5ODA4MTQyN30.qy_qY_21SLST4jtPUmL4BZ-MiIvC-WyynghIab8_q54';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to check if user is admin
async function checkAdmin() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        window.location.href = 'admin-login.html';
        return null;
    }
    return user;
}

// Export for use in other files
window.supabaseClient = supabaseClient;
window.checkAdmin = checkAdmin;