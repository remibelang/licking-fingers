// Admin Settings Management

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupSettingsForm();
});

async function loadSettings() {
    try {
        const { data, error } = await supabaseClient
            .from('settings')
            .select('*')
            .single();
        
        if (error) {
            // If no settings exist, create default
            if (error.code === 'PGRST116') {
                await createDefaultSettings();
                return loadSettings();
            }
            throw error;
        }
        
        document.getElementById('setting-name').value = data.business_name || '';
        document.getElementById('setting-address').value = data.address || '';
        document.getElementById('setting-phone').value = data.phone || '';
        document.getElementById('setting-email').value = data.email || '';
        document.getElementById('setting-about').value = data.about_text || '';
        document.getElementById('setting-hero').value = data.hero_image || '';
        
    } catch (err) {
        console.error('Error loading settings:', err);
    }
}

async function createDefaultSettings() {
    const defaultSettings = {
        business_name: 'Royal Braids',
        address: '123 Beauty Lane, Atlanta, GA 30309',
        phone: '(404) 555-0123',
        email: 'bookings@royalbraids.com',
        about_text: 'We specialize in authentic African hair braiding techniques combined with modern styling.',
        hero_image: ''
    };
    
    try {
        await supabaseClient.from('settings').insert([defaultSettings]);
    } catch (err) {
        console.error('Error creating default settings:', err);
    }
}

function setupSettingsForm() {
    const form = document.getElementById('settings-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const settingsData = {
            business_name: document.getElementById('setting-name').value,
            address: document.getElementById('setting-address').value,
            phone: document.getElementById('setting-phone').value,
            email: document.getElementById('setting-email').value,
            about_text: document.getElementById('setting-about').value,
            hero_image: document.getElementById('setting-hero').value
        };
        
        try {
            // Check if settings exist
            const { data: existing } = await supabaseClient
                .from('settings')
                .select('id')
                .single();
            
            let result;
            if (existing) {
                result = await supabaseClient
                    .from('settings')
                    .update(settingsData)
                    .eq('id', existing.id);
            } else {
                result = await supabaseClient
                    .from('settings')
                    .insert([settingsData]);
            }
            
            if (result.error) throw result.error;
            
            showMessage('settings-message', 'Settings saved successfully!', 'success');
            
        } catch (err) {
            showMessage('settings-message', 'Error saving settings: ' + err.message, 'error');
            console.error(err);
        }
    });
}

function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    if (el) {
        el.className = `message ${type}`;
        el.textContent = text;
        setTimeout(() => {
            el.className = 'message';
            el.textContent = '';
        }, 5000);
    }
}