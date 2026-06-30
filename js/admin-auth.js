// Admin Authentication

document.addEventListener('DOMContentLoaded', function() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Check auth on admin pages (except login)
    const isLoginPage = document.body.classList.contains('admin-login-body');
    if (!isLoginPage) {
        checkAuth();
    }
    
    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('login-message');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        window.location.href = 'admin-dashboard.html';
        
    } catch (err) {
        message.className = 'message error';
        message.textContent = 'Invalid email or password. Please try again.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
}

async function handleLogout(e) {
    e.preventDefault();
    
    try {
        await supabaseClient.auth.signOut();
        window.location.href = 'admin-login.html';
    } catch (err) {
        console.error('Logout error:', err);
    }
}

async function checkAuth() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            window.location.href = 'admin-login.html';
            return;
        }
        
        // Update admin email display
        const emailEl = document.getElementById('admin-email');
        if (emailEl && user.email) {
            emailEl.textContent = user.email;
        }
        
    } catch (err) {
        window.location.href = 'admin-login.html';
    }
}