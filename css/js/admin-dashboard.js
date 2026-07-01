// ============================================
// LICKING FINGERS - ADMIN DASHBOARD JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboardStats();
    loadRecentOrders();
    loadActivityFeed();
    
    // Set admin name
    const adminName = localStorage.getItem('adminName') || 'Admin';
    const nameEl = document.getElementById('adminName');
    if (nameEl) nameEl.textContent = adminName;
});

async function loadDashboardStats() {
    try {
        // Total revenue
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('total');
        
        if (!ordersError && orders) {
            const revenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
            animateValue('totalRevenue', 0, revenue, 1000, (v) => '$' + v.toFixed(2));
        }
        
        // Total orders
        if (!ordersError && orders) {
            animateValue('totalOrders', 0, orders.length, 1000, (v) => v.toLocaleString());
        }
        
        // Pending orders
        const { data: pending, error: pendingError } = await supabase
            .from('orders')
            .select('id', { count: 'exact' })
            .eq('status', 'pending');
        
        if (!pendingError) {
            const pendingCount = pending?.length || 0;
            animateValue('pendingOrders', 0, pendingCount, 1000, (v) => v.toLocaleString());
        }
        
        // Unique customers
        const { data: customers, error: custError } = await supabase
            .from('orders')
            .select('customer_phone');
        
        if (!custError && customers) {
            const uniquePhones = new Set(customers.map(c => c.customer_phone).filter(Boolean));
            animateValue('totalCustomers', 0, uniquePhones.size, 1000, (v) => v.toLocaleString());
        }
        
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

async function loadRecentOrders() {
    const tbody = document.getElementById('recentOrdersTable');
    if (!tbody) return;
    
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false })
            .limit(8);
        
        if (error) throw error;
        
        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#999;">No orders yet.</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(order => {
            const itemCount = order.order_items?.length || 0;
            const statusClass = `status-${order.status || 'pending'}`;
            const statusText = (order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1);
            const date = new Date(order.created_at).toLocaleDateString();
            
            return `
                <tr>
                    <td><strong>#${order.id.toString().padStart(4, '0')}</strong></td>
                    <td>${order.customer_name || 'N/A'}</td>
                    <td>${itemCount} item${itemCount !== 1 ? 's' : ''}</td>
                    <td>$${parseFloat(order.total || 0).toFixed(2)}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${date}</td>
                    <td>
                        <button class="action-btn" onclick="viewOrder(${order.id})" title="View"><i class="fas fa-eye"></i></button>
                        <button class="action-btn" onclick="editOrderStatus(${order.id}, '${order.status}')" title="Edit Status"><i class="fas fa-edit"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (err) {
        console.error('Error loading orders:', err);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#c62828;">Failed to load orders.</td></tr>';
    }
}

async function loadActivityFeed() {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    
    try {
        // Get recent orders
        const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, customer_name, total, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
        
        // Get recent menu updates
        const { data: recentMenu } = await supabase
            .from('menu_items')
            .select('name, created_at')
            .order('created_at', { ascending: false })
            .limit(3);
        
        const activities = [];
        
        (recentOrders || []).forEach(o => {
            activities.push({
                type: 'order',
                icon: 'fa-shopping-bag',
                title: `New Order #${o.id.toString().padStart(4, '0')}`,
                desc: `${o.customer_name} — $${parseFloat(o.total).toFixed(2)}`,
                time: o.created_at
            });
        });
        
        (recentMenu || []).forEach(m => {
            activities.push({
                type: 'menu',
                icon: 'fa-utensils',
                title: 'Menu Item Added',
                desc: m.name,
                time: m.created_at
            });
        });
        
        // Sort by time
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        if (activities.length === 0) {
            feed.innerHTML = '<div class="loading">No recent activity.</div>';
            return;
        }
        
        feed.innerHTML = activities.slice(0, 8).map(a => {
            const timeAgo = getTimeAgo(new Date(a.time));
            return `
                <div class="activity-item">
                    <div class="activity-icon ${a.type}"><i class="fas ${a.icon}"></i></div>
                    <div class="activity-content">
                        <h4>${a.title}</h4>
                        <p>${a.desc}</p>
                    </div>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            `;
        }).join('');
        
    } catch (err) {
        console.error('Error loading activity:', err);
        feed.innerHTML = '<div class="loading" style="color: #c62828;">Failed to load activity.</div>';
    }
}

function viewOrder(id) {
    window.location.href = `admin-orders.html?view=${id}`;
}

async function editOrderStatus(id, currentStatus) {
    const statuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    const newStatus = prompt(`Update status for order #${id}:\n\nCurrent: ${currentStatus}\n\nAvailable: ${statuses.join(', ')}\n\nEnter new status:`, currentStatus);
    
    if (!newStatus || !statuses.includes(newStatus.toLowerCase())) {
        if (newStatus) showToast('Invalid status!', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus.toLowerCase(), updated_at: new Date().toISOString() })
            .eq('id', id);
        
        if (error) throw error;
        
        showToast(`Order #${id} updated to ${newStatus}!`, 'success');
        loadRecentOrders();
        loadActivityFeed();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

function animateValue(id, start, end, duration, formatter) {
    const el = document.getElementById(id);
    if (!el) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        el.textContent = formatter(current);
    }, 16);
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
    if (!token) window.location.href = 'admin-login.html';
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    window.location.href = 'admin-login.html';
}