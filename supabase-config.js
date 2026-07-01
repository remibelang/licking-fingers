// ============================================
// SUPABASE CONFIGURATION - Licking Fingers
// ============================================

const SUPABASE_URL = 'https://wbbsxfoztegjokbnsemq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiYnN4Zm96dGVnam9rYm5zZW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2ODk0MzAsImV4cCI6MjA1MTI2NTQzMH0.utWMF5ctdmY5ENFan1Bkmg_4CKIz8Q1';

// Create Supabase client - must load AFTER the Supabase CDN script
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase initialized for Licking Fingers');