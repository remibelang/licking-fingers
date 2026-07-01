// ============================================
// LICKING FINGERS - SHOPPING CART
// ============================================

const CART_KEY = 'licking_fingers_cart';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function addToCart(id, name, price, image) {
    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: parseFloat(price),
            image: image || 'assets/placeholder-food.jpg',
            quantity: 1
        });
    }
    
    saveCart(cart);
    
    // Show added notification
    showCartNotification(`${name} added to cart!`);
    
    // Animate cart icon
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.3)';
        setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
    }
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    renderCart();
}

function updateQuantity(id, change) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        saveCart(cart);
        renderCart();
    }
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartItemCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const emptyState = document.getElementById('emptyCart');
    const summarySection = document.getElementById('cartSummary');
    
    if (!container) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (summarySection) summarySection.style.display = 'none';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    if (summarySection) summarySection.style.display = 'block';
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/placeholder-food.jpg'">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)"><i class="fas fa-minus"></i></button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)"><i class="fas fa-plus"></i></button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    updateCartSummary();
}

function updateCartSummary() {
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const deliveryEl = document.getElementById('deliveryFee');
    const totalEl = document.getElementById('cartTotal');
    
    const subtotal = getCartTotal();
    const tax = subtotal * 0.08; // 8% tax
    const delivery = subtotal > 0 ? 2.99 : 0;
    const total = subtotal + tax + delivery;
    
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = '$' + tax.toFixed(2);
    if (deliveryEl) deliveryEl.textContent = '$' + delivery.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

function showCartNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.style.cssText = `
        position: fixed; bottom: 30px; right: 30px; background: #8B4513; color: white;
        padding: 15px 25px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 9999; animation: slideUp 0.3s ease; font-weight: 500; display: flex;
        align-items: center; gap: 10px;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('cartItems')) {
        renderCart();
    }
});