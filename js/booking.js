// ============================================
// LICKING FINGERS - TABLE BOOKING SYSTEM
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    const dateInput = document.getElementById('bookingDate');
    const timeSelect = document.getElementById('bookingTime');
    const messageEl = document.getElementById('bookingMessage');
    
    // Set minimum date to today
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }
    
    // Generate time slots
    function generateTimeSlots() {
        if (!timeSelect) return;
        timeSelect.innerHTML = '<option value="">Select a time</option>';
        
        const times = [];
        for (let hour = 11; hour <= 21; hour++) {
            times.push(`${hour}:00`);
            if (hour < 21) times.push(`${hour}:30`);
        }
        
        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        });
    }
    generateTimeSlots();
    
    // Load booked slots to disable them
    async function loadBookedSlots() {
        if (!dateInput || !timeSelect) return;
        
        const selectedDate = dateInput.value;
        if (!selectedDate) return;
        
        try {
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('time')
                .eq('date', selectedDate)
                .neq('status', 'cancelled');
            
            if (error) throw error;
            
            const bookedTimes = bookings?.map(b => b.time) || [];
            
            Array.from(timeSelect.options).forEach(option => {
                if (bookedTimes.includes(option.value)) {
                    option.disabled = true;
                    option.textContent += ' (Booked)';
                } else {
                    option.disabled = false;
                    if (option.textContent.includes(' (Booked)')) {
                        option.textContent = option.value;
                    }
                }
            });
        } catch (err) {
            console.error('Error loading bookings:', err);
        }
    }
    
    if (dateInput) {
        dateInput.addEventListener('change', loadBookedSlots);
    }
    
    // Handle form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            messageEl.className = 'message';
            messageEl.style.display = 'none';
            
            const formData = {
                name: document.getElementById('bookingName').value,
                email: document.getElementById('bookingEmail').value,
                phone: document.getElementById('bookingPhone').value,
                date: document.getElementById('bookingDate').value,
                time: document.getElementById('bookingTime').value,
                guests: parseInt(document.getElementById('bookingGuests').value),
                occasion: document.getElementById('bookingOccasion')?.value || 'dining',
                notes: document.getElementById('bookingNotes')?.value || '',
                status: 'pending',
                created_at: new Date().toISOString()
            };
            
            try {
                // Check if slot is still available
                const { data: existing } = await supabase
                    .from('bookings')
                    .select('id')
                    .eq('date', formData.date)
                    .eq('time', formData.time)
                    .neq('status', 'cancelled')
                    .single();
                
                if (existing) {
                    throw new Error('This time slot has just been booked. Please select another time.');
                }
                
                const { error } = await supabase.from('bookings').insert([formData]);
                if (error) throw error;
                
                messageEl.className = 'message success';
                messageEl.innerHTML = '<i class="fas fa-check-circle"></i> Booking confirmed! We will send a confirmation shortly.';
                messageEl.style.display = 'block';
                bookingForm.reset();
                if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
                generateTimeSlots();
                
            } catch (err) {
                messageEl.className = 'message error';
                messageEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + err.message;
                messageEl.style.display = 'block';
                console.error(err);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Booking';
            }
        });
    }
});