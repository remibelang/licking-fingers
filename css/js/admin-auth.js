// Admin Authentication Module
class AdminAuth {
    constructor() {
        this.init();
    }

    async init() {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // Verify admin role
            const isAdmin = await this.checkAdminRole(session.user);
            if (isAdmin) {
                this.redirectToDashboard();
            } else {
                await supabase.auth.signOut();
                this.showLoginError('Access denied. Admin privileges required.');
            }
        }
    }

    async checkAdminRole(user) {
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) {
                // Fallback: check if email matches admin email
                return user.email === 'belangremi@gmail.com';
            }

            return data && data.role === 'admin';
        } catch (error) {
            console.error('Error checking admin role:', error);
            return false;
        }
    }

    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            const isAdmin = await this.checkAdminRole(data.user);
            if (!isAdmin) {
                await supabase.auth.signOut();
                throw new Error('Access denied. Admin privileges required.');
            }

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    redirectToDashboard() {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'login.html' || currentPage === '') {
            window.location.href = 'admin.html';
        }
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
}

// Initialize admin auth
const adminAuth = new AdminAuth();

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('loginBtn');
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            
            const result = await adminAuth.login(email, password);
            
            if (result.success) {
                window.location.href = 'admin.html';
            } else {
                adminAuth.showLoginError(result.error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            }
        });
    }
});