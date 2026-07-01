// Admin Orders Management
let currentFilter = 'all';
let allOrders = [];

async function loadOrders() {
    try {
        const response = await apiCall('/api/orders');
        const data = await response.json();
        if (data.success) {
            allOrders = data.orders || [];
            updateStats();
            renderOrders();
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function updateStats() {
    const total = allOrders.length;
    const pending = allOrders.filter(o => o.status === 'pending').length;
    const preparing = allOrders.filter(o => o.status === 'preparing').length;
    const today = new Date().toDateString();
    const todayRevenue = allOrders
        .filter(o => {
            const orderDate = new Date(o.created_at).toDateString();
            return orderDate === today && (o.status === 'delivered' || o.status === 'ready');
        })
        .reduce((sum, o) => sum + parseFloat(o.total), 0);
    
    document.getElementById('total-orders').textContent = total;
    document.getElementById('pending-orders').textContent = pending;
    document.getElementById('preparing-orders').textContent = preparing;
    document.getElementById('today-revenue').textContent = '$' + todayRevenue.toFixed(2);
}

function renderOrders() {
    const tbody = document.getElementById('orders-tbody');
    const emptyState = document.getElementById('empty-state');
    const tableContainer = document.getElementById('orders-table-container');
    
    let filteredOrders = currentFilter === 'all' ? allOrders : allOrders.filter(o => o.status === currentFilter);
    filteredOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        tableContainer.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    tableContainer.style.display = 'block';
    
    tbody.innerHTML = filteredOrders.map(order => {
        const orderDate = new Date(order.created_at);
        const timeStr = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const itemsList = order.items ? order.items.map(item => 
            `<div class="order-item">${item.quantity}x ${item.name}</div>`
        ).join('') : '';
        const nextStatus = getNextStatus(order.status);
        const statusClass = `status-${order.status}`;
        
        return `<tr>
            <td class="order-id">#${order.id}</td>
            <td class="customer-info-cell">
                <div class="customer-name">${order.customer_name || 'N/A'}</div>
                <div class="customer-phone">${order.customer_phone || ''}</div>
            </td>
            <td class="order-items">${itemsList}</td>
            <td class="order-total">$${parseFloat(order.total).toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
            <td>${dateStr}<br><small>${timeStr}</small></td>
            <td>
                <div class="status-actions">
                    ${nextStatus ? `<button class="status-btn btn-next" onclick="updateOrderStatus(${order.id}, '${nextStatus}')">
                        <i class="fas fa-arrow-right"></i> ${nextStatus}
                    </button>` : ''}
                </div>
            </td>
        </tr>`;
    }).join('');
}

function getNextStatus(currentStatus) {
    const workflow = { 'pending': 'preparing', 'preparing': 'ready', 'ready': 'delivered', 'delivered': null };
    return workflow[currentStatus] || null;
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await apiCall(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();
        if (data.success) {
            loadOrders();
            showNotification(`Order #${orderId} updated to ${newStatus}`, 'success');
        }
    } catch (error) {
        showNotification('Failed to update order status', 'error');
    }
}

function showNotification(message, type) {
    const notif = document.createElement('div');
    notif.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 15px 25px; 
        background: ${type === 'success' ? '#28a745' : '#dc3545'}; color: white; 
        border-radius: 5px; z-index: 10000; font-weight: 500;`;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderOrders();
        });
    });
    setInterval(loadOrders, 30000);
});
