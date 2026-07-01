// ============================================
// LICKING FINGERS - ADMIN ORDERS MANAGER
// ============================================

let allOrders = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadOrders();
    
    // Filter buttons
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderOrders();
        });
    });
    
    // Search
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderOrders();
        });
    }
});

async function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="8" class="loading"><div class="spinner"></div> Loading orders...</td></tr>';
    
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, menu_items(name))')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        allOrders = data || [];
        renderOrders();
        updateFilterCounts();
    } catch (err) {
        console.error('Error loading orders:', err);
        tbody.innerHTML = '<tr><td colspan="8" class="loading" style="color: #c62828;">Failed to load orders.</td></tr>';
    }
}

function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    const searchTerm = (document.getElementById('orderSearch')?.value || '').toLowerCase();
    
    let filtered = allOrders;
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(o => o.status === currentFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(o => 
            (o.customer_name || '').toLowerCase().includes(searchTerm) ||
            (o.customer_phone || '').includes(searchTerm) ||
            o.id.toString().includes(searchTerm)
        );
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#999;">No orders found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(order => {
        const items = order.order_items || [];
        const itemList = items.map(i => `${i.quantity}x ${i.menu_items?.name || 'Item'}`).join(', ');
        const statusClass = `status-${order.status || 'pending'}`;
        const statusText = (order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1);
        const date = new Date(order.created_at).toLocaleString();
        
        return `
            <tr>
                <td><strong>#${order.id.toString().padStart(4, '0')}</strong></td>
                <td>
                    <div><strong>${order.customer_name || 'N/A'}</strong></div>
                    <small style="color:#999;">${order.customer_phone || ''}</small>
                </td>
                <td title="${itemList}">${items.length} item${items.length !== 1 ? 's' : ''}</td>
                <td>$${parseFloat(order.total || 0).toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${date}</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)" data-current="${order.status}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn" onclick="viewOrderDetails(${order.id})" title="View Details"><i class="fas fa-eye"></i></button>
                    <button class="action-btn" onclick="printOrder(${order.id})" title="Print"><i class="fas fa-print"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateFilterCounts() {
    const counts = { all: allOrders.length, pending: 0, preparing: 0, ready: 0, delivered: 0, cancelled: 0 };
    allOrders.forEach(o => {
        if (counts[o.status] !== undefined) counts[o.status]++;
    });
    
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        const filter = btn.dataset.filter;
        const count = counts[filter] || 0;
        const badge = btn.querySelector('.count-badge');
        if (badge) badge.textContent = count;
    });
}

async function updateOrderStatus(id, newStatus) {
    try {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id);
        
        if (error) throw error;
        
        // Update local data
        const order = allOrders.find(o => o.id === id);
        if (order) order.status = newStatus;
        
        showToast(`Order #${id} marked as ${newStatus}!`, 'success');
        updateFilterCounts();
        renderOrders();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
        // Revert select
        loadOrders();
    }
}

function viewOrderDetails(id) {
    const order = allOrders.find(o => o.id === id);
    if (!order) return;
    
    const items = order.order_items || [];
    const itemList = items.map(i => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
            <span>${i.quantity}x ${i.menu_items?.name || 'Item'}</span>
            <span>$${(i.quantity * parseFloat(i.price_at_time || 0)).toFixed(2)}</span>
        </div>
    `).join('');
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999;
        display: flex; align-items: center; justify-content: center; padding: 20px;
    `;
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 30px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h2 style="color: #8B4513; font-family: 'Playfair Display', serif;">Order #${id.toString().padStart(4, '0')}</h2>
                <button onclick="this.closest('.modal-overlay').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#999;">&times;</button>
            </div>
            <div style="margin-bottom:20px;">
                <p><strong>Customer:</strong> ${order.customer_name || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.customer_phone || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.customer_address || 'N/A'}</p>
                <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
            </div>
            <h3 style="color: #8B4513; margin-bottom: 10px; font-size: 1.1rem;">Items</h3>
            <div style="margin-bottom:20px;">${itemList}</div>
            <div style="border-top: 2px solid #8B4513; padding-top: 15px; display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700;">
                <span>Total</span>
                <span>$${parseFloat(order.total || 0).toFixed(2)}</span>
            </div>
        </div>
    `;
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function printOrder(id) {
    const order = allOrders.find(o => o.id === id);
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    const items = order.order_items || [];
    
    printWindow.document.write(`
        <html>
        <head><title>Order #${id}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 400px; margin: 0 auto; }
            h1 { text-align: center; color: #8B4513; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #8B4513; padding-bottom: 20px; }
            .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ccc; }
            .total { margin-top: 20px; font-size: 1.3rem; font-weight: bold; text-align: right; border-top: 2px solid #8B4513; padding-top: 15px; }
        </style>
        </head>
        <body>
            <div class="header">
                <h1>LICKING FINGERS</h1>
                <p>1137 King James Court, Bear, DE 19701</p>
                <p>Tel: (240) 855-5478</p>
            </div>
            <h2>Order #${id.toString().padStart(4, '0')}</h2>
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Customer:</strong> ${order.customer_name || 'N/A'}</p>
            <p><strong>Phone:</strong> ${order.customer_phone || 'N/A'}</p>
            <hr>
            ${items.map(i => `<div class="item"><span>${i.quantity}x ${i.menu_items?.name || 'Item'}</span><span>$${(i.quantity * parseFloat(i.price_at_time || 0)).toFixed(2)}</span></div>`).join('')}
            <div class="total">Total: $${parseFloat(order.total || 0).toFixed(2)}</div>
            <p style="text-align:center;margin-top:40px;color:#999;font-size:0.9rem;">Thank you for your order!</p>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
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