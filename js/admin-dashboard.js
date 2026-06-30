// Admin Dashboard

document.addEventListener('DOMContentLoaded', async function() {
    await loadDashboardStats();
    await loadRecentBookings();
});

async function loadDashboardStats() {
    try {
        // Count services
        const { count: servicesCount } = await supabaseClient
            .from('services')
            .select('*', { count: 'exact', head: true });
        
        // Count gallery
        const { count: galleryCount } = await supabaseClient
            .from('gallery')
            .select('*', { count: 'exact', head: true });
        
        // Count bookings
        const { count: bookingsCount } = await supabaseClient
            .from('bookings')
            .select('*', { count: 'exact', head: true });
        
        document.getElementById('stat-services').textContent = servicesCount || 0;
        document.getElementById('stat-gallery').textContent = galleryCount || 0;
        document.getElementById('stat-bookings').textContent = bookingsCount || 0;
        
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

async function loadRecentBookings() {
    const tbody = document.getElementById('bookings-table');
    if (!tbody) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('*, services(name)')
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No bookings yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(booking => `
            <tr>
                <td>${booking.name}</td>
                <td>${booking.services?.name || 'N/A'}</td>
                <td>${formatDate(booking.date)}</td>
                <td>${booking.time}</td>
                <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            </tr>
        `).join('');
        
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Error loading bookings</td></tr>';
        console.error(err);
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}