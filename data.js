// data.js - Menu data management

// Default menu items
const defaultMenu = [
    {
        id: 1,
        name: "Jollof Rice",
        price: 12.99,
        description: "Traditional West African rice dish cooked in tomato-based stew with spices",
        image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400",
        category: "Rice Dishes"
    },
    {
        id: 2,
        name: "Egusi Soup",
        price: 15.99,
        description: "Rich melon seed soup with vegetables and your choice of protein",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        category: "Soups"
    },
    {
        id: 3,
        name: "Pounded Yam",
        price: 8.99,
        description: "Smooth, fluffy yam pounded to perfection, served with soup",
        image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400",
        category: "Swallows"
    },
    {
        id: 4,
        name: "Beef Suya",
        price: 10.99,
        description: "Spicy grilled beef skewers with peanut spice blend",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
        category: "Grilled"
    },
    {
        id: 5,
        name: "Afang Soup",
        price: 16.99,
        description: "Nutritious vegetable soup with meat and seafood",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        category: "Soups"
    },
    {
        id: 6,
        name: "Moi Moi",
        price: 6.99,
        description: "Steamed bean pudding with eggs and spices",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        category: "Sides"
    }
];

// Initialize menu in localStorage if not exists
function initMenu() {
    if (!localStorage.getItem('menu')) {
        localStorage.setItem('menu', JSON.stringify(defaultMenu));
    }
}

// Get menu items
function getMenu() {
    initMenu();
    return JSON.parse(localStorage.getItem('menu')) || [];
}

// Save menu items
function saveMenu(menu) {
    localStorage.setItem('menu', JSON.stringify(menu));
}

// Get next item ID
function getNextId() {
    const menu = getMenu();
    return Math.max(...menu.map(item => item.id), 0) + 1;
}

// Add new item
function addMenuItem(item) {
    const menu = getMenu();
    item.id = getNextId();
    menu.push(item);
    saveMenu(menu);
    return item;
}

// Update item
function updateMenuItem(id, updates) {
    const menu = getMenu();
    const index = menu.findIndex(item => item.id === id);
    if (index !== -1) {
        menu[index] = { ...menu[index], ...updates };
        saveMenu(menu);
        return menu[index];
    }
    return null;
}

// Delete item
function deleteMenuItem(id) {
    let menu = getMenu();
    menu = menu.filter(item => item.id !== id);
    saveMenu(menu);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getMenu, saveMenu, addMenuItem, updateMenuItem, deleteMenuItem, initMenu };
}