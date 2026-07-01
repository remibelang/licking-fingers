// ============================================
// LICKING FINGERS - CHECKOUT & ORDER PLACEMENT
// ============================================

const TAX_RATE = 0.08;
const DELIVERY_FEE = 2.99;

document.addEventListener('DOMContentLoaded', () => {
    // Render cart on checkout page
    if (document.getElementById('checkoutItems')) {
        renderCheckout();
    }
    
    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await placeOrder();
        });
    }
    
    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', () => {
            const cardSection = document.getElementById('cardPaymentSection');
            if (cardSection) {
                cardSection.style.display = method.value === 'card' ? 'block' : 'none';
            }
        });
    });
});

function renderCheckout() {
    const container = document.getElementById('checkoutItems');
    const summaryContainer = document.getElementById('checkoutSummary');
    if (!container) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-checkout"><i class="fas fa-shopping-bag"></i><h3>Your cart is empty</h3><a href="index.html#menu" class="btn-primary">Browse Menu</a></div>';
        if (summaryContainer) summaryContainer.style.display = 'none';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/placeholder-food.jpg'">
            <div class="checkout-item-info">
                <h4>${item.name}</h4>
                <p>${item.quantity}x $${item.price.toFixed(2)}</p>
            </div>
            <span class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    updateCheckoutTotals();
}

function updateCheckoutTotals() {
    const subtotal = getCartTotal();
    const tax = subtotal * TAX_RATE;
    const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + tax + delivery;
    
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const taxEl = document.getElementById('checkoutTax');
    const deliveryEl = document.getElementById('checkoutDelivery');
    const totalEl = document.getElementById('checkoutTotal');
    const finalTotalEl = document.getElementById('finalTotal');
    
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = '$' + tax.toFixed(2);
    if (deliveryEl) deliveryEl.textContent = '$' + delivery.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
    if (finalTotalEl) finalTotalEl.textContent = '$' + total.toFixed(2);
    
    return { subtotal, tax, delivery, total };
}

async function placeOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        showCheckoutMessage('Your cart is empty!', 'error');
        return;
    }
    
    const name = document.getElementById('customerName')?.value.trim();
    const phone = document.getElementById('customerPhone')?.value.trim();
    const address = document.getElementById('customerAddress')?.value.trim();
    const notes = document.getElementById('orderNotes')?.value.trim() || '';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';
    
    if (!name || !phone || !address) {
        showCheckoutMessage('Please fill in all required fields!', 'error');
        return;
    }
    
    const btn = document.querySelector('#checkoutForm button[type="submit"]');
    showCheckoutLoading(btn, true);
    
    try {
        const totals = updateCheckoutTotals();
        
        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                customer_name: name,
                customer_phone: phone,
                customer_address: address,
                total: totals.total,
                subtotal: totals.subtotal,
                tax: totals.tax,
                delivery_fee: totals.delivery,
                status: 'pending',
                payment_method: paymentMethod,
                notes: notes,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (orderError) throw orderError;
        
        // Create order items
        const orderItems = cart.map(item => ({
            order_id: order.id,
            menu_item_id: item.id,
            quantity: item.quantity,
            price_at_time: item.price
        }));
        
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);
        
        if (itemsError) throw itemsError;
        
        // Clear cart
        clearCart();
        
        // Redirect to confirmation
        window.location.href = `order-confirmation.html?order=${order.id}&total=${totals.total.toFixed(2)}`;
        
    } catch (err) {
        console.error('Order error:', err);
        showCheckoutMessage('Failed to place order: ' + err.message, 'error');
        showCheckoutLoading(btn, false);
    }
}

function showCheckoutMessage(message, type) {
    const msgEl = document.getElementById('checkoutMessage');
    if (!msgEl) {
        alert(message);
        return;
    }
    msgEl.className = `message ${type}`;
    msgEl.textContent = message;
    msgEl.style.display = 'block';
}

function showCheckoutLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading 
        ? '<i class="fas fa-spinner fa-spin"></i> Placing Order...' 
        : '<i class="fas fa-check-circle"></i> Place Order';
}

// Helper to get cart from cart.js
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('licking_fingers_cart')) || [];
    } catch {
        return [];
    }
}

function getCartTotal() {
    return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function clearCart() {
    localStorage.removeItem('licking_fingers_cart');
}