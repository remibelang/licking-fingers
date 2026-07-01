// Cart functionality

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Add item to cart
function addToCart(item) {
    let cart = getCart();
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    saveCart(cart);
    showNotification('Added to cart!', 'success');
}

// Update cart count badge
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

// Show notification
function showNotification(message, type) {
    const notif = document.createElement('div');
    notif.style.cssText = "position: fixed; top: 100px; right: 20px; padding: 15px 25px; background: " + (type === 'success' ? '#28a745' : '#17a2b8') + "; color: white; border-radius: 8px; z-index: 10000;";
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(function() { notif.remove(); }, 3000);
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', updateCartCount);
