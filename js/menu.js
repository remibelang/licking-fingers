// Load menu items from local JSON file
async function loadMenuItems() {
    try {
        const response = await fetch('menu.json');
        if (!response.ok) {
            throw new Error('Failed to load menu');
        }
        const data = await response.json();
        displayMenuItems(data.menu);
    } catch (error) {
        console.error('Error loading menu:', error);
        // Fallback: load hardcoded menu if JSON fails
        loadHardcodedMenu();
    }
}

// Fallback hardcoded menu
function loadHardcodedMenu() {
    const menu = [
        {
            id: 1,
            name: "Jollof Rice",
            description: "Classic West African rice dish",
            price: 15.99,
            image_path: "./uploads/jelof-rice.jpg"
        },
        {
            id: 2,
            name: "Fufu Corn and Khati Khati",
            description: "Traditional corn fufu with khati khati soup",
            price: 18.99,
            image_path: "./uploads/1771044943351-fufu-corn and khati khati.jpg"
        },
        {
            id: 3,
            name: "Pounded Yam and Egusi Soup",
            description: "Smooth pounded yam with egusi soup",
            price: 19.99,
            image_path: "./uploads/1771045253898-pounded Yam and Egussi Soup.jpg"
        },
        {
            id: 4,
            name: "Puff Puff and Beans",
            description: "Sweet fried dough with beans",
            price: 12.99,
            image_path: "./uploads/1771045535447-puff-and-beans.webp"
        },
        {
            id: 5,
            name: "Suya",
            description: "Spicy grilled meat skewers",
            price: 14.99,
            image_path: "./uploads/1771046757558-suya.jpg"
        }
    ];
    displayMenuItems(menu);
}

// Display menu items on the page
function displayMenuItems(menuItems) {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) {
        console.error('Menu container not found');
        return;
    }
    
    menuContainer.innerHTML = menuItems.map(item => `
        <div class="menu-item" data-id="${item.id}">
            <img src="${item.image_path}" alt="${item.name}" onerror="this.src='./uploads/jelof-rice.jpg'">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">$${item.price.toFixed(2)}</p>
            <button onclick="addToCart(${item.id})">Add to Cart</button>
        </div>
    `).join('');
}

// Add to cart function
function addToCart(itemId) {
    fetch('menu.json')
        .then(response => response.json())
        .then(data => {
            const item = data.menu.find(i => i.id === itemId);
            if (item) {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                // Check if item already exists in cart
                const existingItem = cart.find(i => i.id === itemId);
                if (existingItem) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                } else {
                    // Add new item with quantity
                    item.quantity = 1;
                    cart.push(item);
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                alert(`${item.name} added to cart!`);
                updateCartCount();
            }
        })
        .catch(() => {
            // Fallback if JSON not available
            const hardcodedItems = {
                1: {id: 1, name: "Jollof Rice", price: 15.99, image_path: "./uploads/jelof-rice.jpg"},
                2: {id: 2, name: "Fufu Corn and Khati Khati", price: 18.99, image_path: "./uploads/1771044943351-fufu-corn and khati khati.jpg"},
                3: {id: 3, name: "Pounded Yam and Egusi Soup", price: 19.99, image_path: "./uploads/1771045253898-pounded Yam and Egussi Soup.jpg"},
                4: {id: 4, name: "Puff Puff and Beans", price: 12.99, image_path: "./uploads/1771045535447-puff-and-beans.webp"},
                5: {id: 5, name: "Suya", price: 14.99, image_path: "./uploads/1771046757558-suya.jpg"}
            };
            const item = hardcodedItems[itemId];
            if (item) {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                item.quantity = 1; cart.push(item);
                localStorage.setItem('cart', JSON.stringify(cart));
                alert(`${item.name} added to cart!`);
            }
        });
}

updateCartCount(); // Update cart count immediately`n// Load menu when page loads
document.addEventListener('DOMContentLoaded', loadMenuItems);




// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Update all cart count elements on the page
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        if (totalItems > 0) {
            el.style.display = 'inline-block';
        } else {
            el.style.display = 'none';
        }
    });
}

// Update cart count when page loads
document.addEventListener('DOMContentLoaded', updateCartCount);



