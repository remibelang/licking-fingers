// Utility Functions

// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate order number
function generateOrderNumber() {
    return 'LF' + Date.now().toString(36).toUpperCase();
}

// Validate phone number
function validatePhone(phone) {
    const regex = /^[\d\s\-\+\(\)]{10,}$/;
    return regex.test(phone.replace(/\s/g, ''));
}

// Validate email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Loading spinner
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>${message}</p></div>`;
    }
}

// Local storage helpers
const Storage = {
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    remove: (key) => localStorage.removeItem(key),
    clear: () => localStorage.clear()
};

// Cart helpers
const Cart = {
    get: () => Storage.get('cart') || [],
    set: (cart) => Storage.set('cart', cart),
    add: (item) => {
        const cart = Cart.get();
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            cart.push(item);
        }
        Cart.set(cart);
    },
    remove: (itemId) => {
        const cart = Cart.get().filter(i => i.id !== itemId);
        Cart.set(cart);
    },
    update: (itemId, quantity) => {
        const cart = Cart.get();
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                Cart.remove(itemId);
                return;
            }
            Cart.set(cart);
        }
    },
    clear: () => Storage.remove('cart'),
    getCount: () => Cart.get().reduce((sum, item) => sum + item.quantity, 0),
    getTotal: () => Cart.get().reduce((sum, item) => sum + (item.price * item.quantity), 0)
};

// Export for use in other files
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.debounce = debounce;
window.generateOrderNumber = generateOrderNumber;
window.validatePhone = validatePhone;
window.validateEmail = validateEmail;
window.showToast = showToast;
window.showLoading = showLoading;
window.Storage = Storage;
window.Cart = Cart;