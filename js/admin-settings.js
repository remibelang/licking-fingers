// ============================================
// LICKING FINGERS - ADMIN SETTINGS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadSettings();
    
    // Business Info Form
    const businessForm = document.getElementById('businessForm');
    if (businessForm) {
        businessForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveBusinessInfo();
        });
    }
    
    // Hours Form
    const hoursForm = document.getElementById('hoursForm');
    if (hoursForm) {
        hoursForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveHours();
        });
    }
    
    // Password Form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await changePassword();
        });
    }
});

async function loadSettings() {
    try {
        // Load business info
        const { data: business, error: bizError } = await supabase
            .from('settings')
            .select('*')
            .eq('key', 'business_info')
            .single();
        
        if (business && !bizError) {
            const info = business.value || {};
            setValue('bizName', info.name);
            setValue('bizAddress', info.address);
            setValue('bizPhone', info.phone);
            setValue('bizEmail', info.email);
            setValue('bizDescription', info.description);
        }
        
        // Load hours
        const { data: hours, error: hrsError } = await supabase
            .from('settings')
            .select('*')
            .eq('key', 'business_hours')
            .single();
        
        if (hours && !hrsError) {
            const h = hours.value || {};
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                setValue(`${day}Open`, h[day]?.open || '');
                setValue(`${day}Close`, h[day]?.close || '');
                const closedCheckbox = document.getElementById(`${day}Closed`);
                if (closedCheckbox) closedCheckbox.checked = h[day]?.closed || false;
            });
        }
        
    } catch (err) {
        console.error('Error loading settings:', err);
    }
}

async function saveBusinessInfo() {
    const btn = document.querySelector('#businessForm button[type="submit"]');
    showLoading(btn, true);
    
    try {
        const info = {
            name: getValue('bizName'),
            address: getValue('bizAddress'),
            phone: getValue('bizPhone'),
            email: getValue('bizEmail'),
            description: getValue('bizDescription')
        };
        
        const { error } = await supabase
            .from('settings')
            .upsert({ key: 'business_info', value: info }, { onConflict: 'key' });
        
        if (error) throw error;
        showToast('Business information saved successfully!', 'success');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        showLoading(btn, false, 'Save Changes');
    }
}

async function saveHours() {
    const btn = document.querySelector('#hoursForm button[type="submit"]');
    showLoading(btn, true);
    
    try {
        const hours = {};
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
            const closedCheckbox = document.getElementById(`${day}Closed`);
            hours[day] = {
                open: getValue(`${day}Open`),
                close: getValue(`${day}Close`),
                closed: closedCheckbox ? closedCheckbox.checked : false
            };
        });
        
        const { error } = await supabase
            .from('settings')
            .upsert({ key: 'business_hours', value: hours }, { onConflict: 'key' });
        
        if (error) throw error;
        showToast('Business hours saved successfully!', 'success');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        showLoading(btn, false, 'Save Hours');
    }
}

async function changePassword() {
    const currentPass = getValue('currentPassword');
    const newPass = getValue('newPassword');
    const confirmPass = getValue('confirmPassword');
    
    if (newPass !== confirmPass) {
        showToast('New passwords do not match!', 'error');
        return;
    }
    
    if (newPass.length < 6) {
        showToast('Password must be at least 6 characters!', 'error');
        return;
    }
    
    const btn = document.querySelector('#passwordForm button[type="submit"]');
    showLoading(btn, true);
    
    try {
        // Verify current password
        const { data: admin, error: verifyError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', 'admin')
            .single();
        
        if (verifyError || !admin || admin.password !== currentPass) {
            throw new Error('Current password is incorrect!');
        }
        
        const { error } = await supabase
            .from('admin_users')
            .update({ password: newPass })
            .eq('username', 'admin');
        
        if (error) throw error;
        
        showToast('Password changed successfully!', 'success');
        document.getElementById('passwordForm').reset();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        showLoading(btn, false, 'Change Password');
    }
}

// Helper functions
function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function showLoading(btn, loading, text) {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading ? '<i class="fas fa-spinner fa-spin"></i> Saving...' : text;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 8px;
        color: white; font-weight: 500; z-index: 9999; animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #388E3C;' : 'background: #D32F2F;'}
    `;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'admin-login.html';
    }
}