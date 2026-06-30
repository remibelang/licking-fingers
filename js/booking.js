// Booking Form Handler

document.addEventListener('DOMContentLoaded', function() {
    loadBookingServices();
    setupBookingForm();
});

async function loadBookingServices() {
    const select = document.getElementById('service');
    if (!select) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('services')
            .select('id, name')
            .eq('active', true)
            .order('name');
        
        if (error) throw error;
        
        // Keep the first option
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        data.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Error loading services:', err);
    }
}

function setupBookingForm() {
    const form = document.getElementById('booking-form');
    const message = document.getElementById('booking-message');
    
    if (!form) return;
    
    // Set minimum date to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            service_id: document.getElementById('service').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            notes: document.getElementById('notes').value,
            status: 'pending'
        };
        
        try {
            const { data, error } = await supabaseClient
                .from('bookings')
                .insert([formData])
                .select();
            
            if (error) throw error;
            
            message.className = 'message success';
            message.textContent = 'Booking request submitted successfully! We will contact you shortly to confirm.';
            form.reset();
            
        } catch (err) {
            message.className = 'message error';
            message.textContent = 'Error submitting booking. Please try again or call us directly.';
            console.error(err);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}