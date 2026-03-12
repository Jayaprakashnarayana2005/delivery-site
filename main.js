/*******************************************
 * FOOD ORDERING SYSTEM - ENHANCED VERSION
 * New Features Added:
 * - Restaurant Selection
 * - Food Ratings & Reviews
 * - Special Offers & Coupons
 * - Order Tracking Timeline
 * - Favorites/Wishlist
 * - Reorder Previous Orders
 * - Estimated Delivery Time
 * - Food Customization Options
 * - Multiple Payment Methods
 * - Order History with Filters
 *******************************************/
// Add quick admin actions for logged-in admins
function addQuickAdminActions() {
    if (!currentUser) return;
    
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const isAdmin = admins.some(a => a.email === currentUser.email);
    
    if (isAdmin) {
        // Add quick edit buttons on menu items
        document.querySelectorAll('.menu-card').forEach(card => {
            const adminEditBtn = document.createElement('button');
            adminEditBtn.className = 'admin-quick-edit';
            adminEditBtn.innerHTML = '<i class="fas fa-edit"></i>';
            adminEditBtn.onclick = (e) => {
                e.stopPropagation();
                const itemId = card.querySelector('.add-to-cart')?.getAttribute('onclick')?.match(/\d+/)?.[0];
                if (itemId) {
                    quickEditMenuItem(itemId);
                }
            };
            card.appendChild(adminEditBtn);
        });
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .menu-card {
                position: relative;
            }
            .admin-quick-edit {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s;
                z-index: 10;
            }
            .menu-card:hover .admin-quick-edit {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
}

// Quick edit menu item
function quickEditMenuItem(itemId) {
    // Store item ID and redirect to admin panel
    localStorage.setItem('editItemId', itemId);
    window.location.href = 'admin-dashboard.html?tab=menu&edit=' + itemId;
}

// Call after loading menu
document.addEventListener('menuLoaded', addQuickAdminActions);
// Add this near the top of your main.js
// Load admin connection
const adminScript = document.createElement('script');
adminScript.src = 'js/admin-connection.js';
document.head.appendChild(adminScript);

// Update the existing updateUIForLoggedInUser function
function updateUIForLoggedInUser() {
    const navAuth = document.getElementById('navAuth');
    if (navAuth && currentUser) {
        // Check if user is admin
        const admins = JSON.parse(localStorage.getItem('admins')) || [];
        const isAdmin = admins.some(a => a.email === currentUser.email);
        
        navAuth.innerHTML = `
            <span class="user-name">
                Hi, ${currentUser.name}
                ${isAdmin ? '<i class="fas fa-crown" style="color: #667eea; margin-left: 5px;"></i>' : ''}
            </span>
            ${isAdmin ? '<a href="admin-dashboard.html" class="btn-login" style="margin-right: 5px;">Dashboard</a>' : ''}
            <button class="btn-login" onclick="logout()">Logout</button>
        `;
    }
}

// Add this function to sync orders with admin panel
function placeOrder(event) {
    event.preventDefault();
    
    // Your existing order placement code...
    
    // After saving order, notify admin panel
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Trigger sync with admin
    if (window.AdminConnection) {
        AdminConnection.syncWithAdmin('orders', JSON.stringify(orders));
    }
    
    // Rest of your existing code...
}

// Add this to track user actions for admin
function trackUserAction(action, details) {
    const adminLogs = JSON.parse(localStorage.getItem('adminLogs')) || [];
    adminLogs.push({
        userId: currentUser?.id,
        action: action,
        details: details,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('adminLogs', JSON.stringify(adminLogs));
}
// Global variables
let currentUser = null;
let cart = [];
let favorites = [];
let appliedCoupon = null;
let selectedRestaurant = null;

// Load data from localStorage
function loadFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
    }
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Sample data - Restaurants
const restaurants = [
    {
        id: 1,
        name: 'Pizza Paradise',
        cuisine: 'Italian',
        rating: 4.5,
        deliveryTime: '30-40 min',
        minOrder: 199,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        offers: ['50% off on first order', 'Free delivery on orders above ₹499']
    },
    {
        id: 2,
        name: 'Burger King',
        cuisine: 'American',
        rating: 4.3,
        deliveryTime: '25-35 min',
        minOrder: 149,
        image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500',
        offers: ['Buy 1 Get 1 Free', '20% off on weekends']
    },
    {
        id: 3,
        name: 'Sushi Master',
        cuisine: 'Japanese',
        rating: 4.7,
        deliveryTime: '40-50 min',
        minOrder: 299,
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500',
        offers: ['Free Sushi roll on order above ₹999', 'Combo offers available']
    },
    {
        id: 4,
        name: 'Pasta House',
        cuisine: 'Italian',
        rating: 4.4,
        deliveryTime: '35-45 min',
        minOrder: 249,
        image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500',
        offers: ['20% off on pasta combos', 'Free garlic bread']
    }
];

// Sample data - Categories
const categories = [
    { id: 1, name: 'Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500', restaurantId: 1 },
    { id: 2, name: 'Burgers', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500', restaurantId: 2 },
    { id: 3, name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500', restaurantId: 3 },
    { id: 4, name: 'Pasta', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500', restaurantId: 4 },
    { id: 5, name: 'Salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', restaurantId: 4 },
    { id: 6, name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500', restaurantId: 1 }
];

// Sample data - Menu Items with customization options
const menuItems = [
    {
        id: 1,
        categoryId: 1,
        restaurantId: 1,
        name: 'Margherita Pizza',
        description: 'Fresh tomatoes, mozzarella, basil',
        price: 499,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
        rating: 4.5,
        totalRatings: 128,
        isVeg: true,
        customization: [
            { name: 'Extra Cheese', price: 50 },
            { name: 'Olives', price: 40 },
            { name: 'Mushrooms', price: 60 }
        ]
    },
    {
        id: 2,
        categoryId: 2,
        restaurantId: 2,
        name: 'Classic Burger',
        description: 'Beef patty, lettuce, tomato, cheese',
        price: 299,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500',
        rating: 4.3,
        totalRatings: 95,
        isVeg: false,
        customization: [
            { name: 'Extra Patty', price: 80 },
            { name: 'Bacon', price: 60 },
            { name: 'Jalapenos', price: 30 }
        ]
    },
    {
        id: 3,
        categoryId: 3,
        restaurantId: 3,
        name: 'California Roll',
        description: 'Crab, avocado, cucumber',
        price: 599,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
        rating: 4.7,
        totalRatings: 156,
        isVeg: false,
        customization: [
            { name: 'Wasabi', price: 20 },
            { name: 'Ginger', price: 15 },
            { name: 'Soy Sauce', price: 10 }
        ]
    },
    {
        id: 4,
        categoryId: 4,
        restaurantId: 4,
        name: 'Carbonara Pasta',
        description: 'Creamy sauce, bacon, parmesan',
        price: 449,
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500',
        rating: 4.4,
        totalRatings: 112,
        isVeg: false,
        customization: [
            { name: 'Extra Cheese', price: 50 },
            { name: 'Mushrooms', price: 40 },
            { name: 'Chicken', price: 70 }
        ]
    },
    {
        id: 5,
        categoryId: 2,
        restaurantId: 2,
        name: 'Veg Burger',
        description: 'Veg patty, lettuce, cheese, special sauce',
        price: 199,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500',
        rating: 4.2,
        totalRatings: 78,
        isVeg: true,
        customization: [
            { name: 'Extra Cheese', price: 40 },
            { name: 'Grilled Mushrooms', price: 50 }
        ]
    },
    {
        id: 6,
        categoryId: 4,
        restaurantId: 4,
        name: 'White Sauce Pasta',
        description: 'Creamy white sauce with mushrooms',
        price: 349,
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500',
        rating: 4.5,
        totalRatings: 89,
        isVeg: true,
        customization: [
            { name: 'Extra Cheese', price: 50 },
            { name: 'Broccoli', price: 40 }
        ]
    }
];

// Sample data - Offers and Coupons
const coupons = [
    { code: 'WELCOME50', discount: 50, type: 'flat', minOrder: 199, description: '₹50 off on first order' },
    { code: 'SAVE20', discount: 20, type: 'percent', minOrder: 399, maxDiscount: 100, description: '20% off up to ₹100' },
    { code: 'FREEDEL', discount: 99, type: 'delivery', minOrder: 299, description: 'Free delivery on orders above ₹299' },
    { code: 'WEEKEND30', discount: 30, type: 'percent', minOrder: 499, maxDiscount: 150, description: '30% off up to ₹150' }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    loadRestaurants();
    loadCategories();
    loadFeaturedItems();
    loadOffers();
    updateCartCount();
    updateUIForLoggedInUser();
    updateFavoritesUI();
    
    // Check which page we're on
    const path = window.location.pathname;
    if (path.includes('menu.html')) {
        loadMenuPage();
    }
    if (path.includes('cart.html')) {
        loadCartPage();
    }
    if (path.includes('orders.html')) {
        loadOrdersPage();
    }
    if (path.includes('restaurant.html')) {
        loadRestaurantPage();
    }
});

// Load restaurants on homepage
function loadRestaurants() {
    const restaurantGrid = document.getElementById('restaurantGrid');
    if (!restaurantGrid) return;

    let html = '';
    for (let restaurant of restaurants) {
        html += `
            <div class="restaurant-card" onclick="selectRestaurant(${restaurant.id})">
                <img src="${restaurant.image}" alt="${restaurant.name}">
                <div class="restaurant-info">
                    <h3>${restaurant.name}</h3>
                    <p>${restaurant.cuisine} • ⭐ ${restaurant.rating}</p>
                    <p>🕒 ${restaurant.deliveryTime} • Min ₹${restaurant.minOrder}</p>
                    ${restaurant.offers.slice(0,1).map(offer => 
                        `<span class="offer-tag">${offer}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    restaurantGrid.innerHTML = html;
}

// Select restaurant
function selectRestaurant(restaurantId) {
    selectedRestaurant = restaurantId;
    window.location.href = 'pages/menu.html?restaurant=' + restaurantId;
}

// Load categories
function loadCategories() {
    const categoryGrid = document.getElementById('categoryGrid');
    if (!categoryGrid) return;

    let html = '';
    for (let category of categories) {
        html += `
            <div class="category-card" onclick="filterByCategory(${category.id})">
                <img src="${category.image}" alt="${category.name}">
                <h3>${category.name}</h3>
            </div>
        `;
    }
    categoryGrid.innerHTML = html;
}

// Load featured items
function loadFeaturedItems() {
    const featuredMenu = document.getElementById('featuredMenu');
    if (!featuredMenu) return;

    let html = '';
    for (let i = 0; i < Math.min(4, menuItems.length); i++) {
        const item = menuItems[i];
        const isFavorite = favorites.includes(item.id);
        html += `
            <div class="menu-card">
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-info">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${item.name}</h3>
                        <i class="fas fa-heart ${isFavorite ? 'favorite' : ''}" 
                           onclick="toggleFavorite(${item.id})" 
                           style="color: ${isFavorite ? '#ff6b6b' : '#ddd'}; cursor: pointer;"></i>
                    </div>
                    <p>${item.description}</p>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="rating">⭐ ${item.rating}</span>
                        <span class="veg-badge ${item.isVeg ? 'veg' : 'non-veg'}">${item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                    </div>
                    <div class="menu-footer">
                        <span class="price">₹${item.price}</span>
                        <button class="add-to-cart" onclick="openCustomizationModal(${item.id})">
                            <i class="fas fa-shopping-cart"></i> Customize
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    featuredMenu.innerHTML = html;
}

// Load offers
function loadOffers() {
    const offersContainer = document.getElementById('offersContainer');
    if (!offersContainer) return;

    let html = '';
    for (let coupon of coupons) {
        html += `
            <div class="offer-card">
                <div class="offer-content">
                    <h4>${coupon.code}</h4>
                    <p>${coupon.description}</p>
                    <p class="offer-min">Min order: ₹${coupon.minOrder}</p>
                </div>
                <button onclick="applyCoupon('${coupon.code}')" class="apply-coupon">Apply</button>
            </div>
        `;
    }
    offersContainer.innerHTML = html;
}

// Toggle favorite
function toggleFavorite(itemId) {
    const index = favorites.indexOf(itemId);
    if (index === -1) {
        favorites.push(itemId);
        showToast('Added to favorites!');
    } else {
        favorites.splice(index, 1);
        showToast('Removed from favorites');
    }
    saveToStorage();
    updateFavoritesUI();
    loadFeaturedItems(); // Refresh display
}

// Update favorites UI
function updateFavoritesUI() {
    const favCount = document.getElementById('favoritesCount');
    if (favCount) {
        favCount.textContent = favorites.length;
    }
}

// Open customization modal
// Open customization modal (improved version)
function openCustomizationModal(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Store current item ID for total calculation
    window.currentCustomizingItem = item;
    
    let customHtml = `
        <div id="customizationModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeCustomizationModal()">&times;</span>
                <h2>Customize ${item.name}</h2>
                <img src="${item.image}" alt="${item.name}">
                <p style="margin: 1rem 0; color: #666;">${item.description}</p>
                <p style="font-weight: bold; color: var(--primary-color); font-size: 1.2rem; margin-bottom: 1.5rem;">Base Price: ₹${item.price}</p>
                
                <h3 style="margin: 1rem 0; color: var(--dark-color);">Add Extras</h3>
                <div style="max-height: 300px; overflow-y: auto; margin-bottom: 1rem;">
    `;
    
    for (let opt of item.customization) {
        customHtml += `
            <div class="customization-option">
                <label>
                    <input type="checkbox" value="${opt.name}" data-price="${opt.price}" onchange="updateCustomizationTotal()">
                    <span>${opt.name}</span>
                </label>
                <span class="option-price">+₹${opt.price}</span>
            </div>
        `;
    }
    
    customHtml += `
                </div>
                
                <div style="background: white; padding-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span style="font-size: 1.1rem;">Total Price:</span>
                        <span style="font-size: 1.3rem; font-weight: bold; color: var(--primary-color);">₹<span id="customTotal">${item.price}</span></span>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button onclick="closeCustomizationModal()" style="flex: 1; padding: 1rem; background: #f5f5f5; color: #666; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
                        <button onclick="addCustomizedToCart(${item.id})" class="btn-submit" style="flex: 2;">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('customizationModal');
    if (existingModal) existingModal.remove();
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', customHtml);
    
    // Show modal
    const modal = document.getElementById('customizationModal');
    modal.style.display = 'block';
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

// Update customization total (improved version)
function updateCustomizationTotal() {
    const checkboxes = document.querySelectorAll('#customizationModal input[type="checkbox"]:checked');
    const basePrice = window.currentCustomizingItem ? window.currentCustomizingItem.price : 0;
    let extra = 0;
    
    for (let cb of checkboxes) {
        extra += parseInt(cb.dataset.price || 0);
    }
    
    const total = basePrice + extra;
    document.getElementById('customTotal').textContent = total;
}

// Close customization modal (improved version)
function closeCustomizationModal() {
    const modal = document.getElementById('customizationModal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
   
}

// Update customization total
function updateCustomizationTotal() {
    const checkboxes = document.querySelectorAll('#customizationModal input[type="checkbox"]:checked');
    const basePrice = menuItems.find(i => i.id === parseInt(currentItemId))?.price || 0;
    let extra = 0;
    
    for (let cb of checkboxes) {
        extra += parseInt(cb.dataset.price);
    }
    
    document.getElementById('customTotal').textContent = basePrice + extra;
}

// Add customized item to cart
function addCustomizedToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const checkboxes = document.querySelectorAll('#customizationModal input[type="checkbox"]:checked');
    let customizations = [];
    let extraPrice = 0;
    
    for (let cb of checkboxes) {
        customizations.push(cb.value);
        extraPrice += parseInt(cb.dataset.price);
    }
    
    const customizedItem = {
        ...item,
        customizations: customizations,
        extraPrice: extraPrice,
        finalPrice: item.price + extraPrice
    };
    
    // Check if similar item exists
    let found = false;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === itemId && 
            JSON.stringify(cart[i].customizations) === JSON.stringify(customizations)) {
            cart[i].quantity = (cart[i].quantity || 1) + 1;
            found = true;
            break;
        }
    }
    
    if (!found) {
        cart.push({
            ...customizedItem,
            quantity: 1
        });
    }
    
    saveToStorage();
    updateCartCount();
    closeCustomizationModal();
    showToast('Item added to cart with customizations!');
}

// Close customization modal
function closeCustomizationModal() {
    const modal = document.getElementById('customizationModal');
    if (modal) modal.remove();
}

// Apply coupon
function applyCoupon(code) {
    const coupon = coupons.find(c => c.code === code);
    if (!coupon) return;
    
    // Check if user is logged in
    if (!currentUser) {
        showToast('Please login to apply coupon', 'error');
        openLoginModal();
        return;
    }
    
    // Calculate cart total
    const cartTotal = cart.reduce((sum, item) => sum + (item.finalPrice || item.price) * (item.quantity || 1), 0);
    
    if (cartTotal < coupon.minOrder) {
        showToast(`Minimum order of ₹${coupon.minOrder} required`, 'error');
        return;
    }
    
    appliedCoupon = coupon;
    showToast(`Coupon ${code} applied successfully!`);
    if (window.location.pathname.includes('cart.html')) {
        loadCartPage();
    }
}

// Filter by category
function filterByCategory(categoryId) {
    window.location.href = 'pages/menu.html?category=' + categoryId;
}

// Search food
function searchFood() {
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm.trim()) {
        window.location.href = 'pages/menu.html?search=' + searchTerm;
    }
}

// Cart functions
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    let found = false;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === itemId && !cart[i].customizations) {
            cart[i].quantity = (cart[i].quantity || 1) + 1;
            found = true;
            break;
        }
    }
    
    if (!found) {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    saveToStorage();
    updateCartCount();
    showToast('Item added to cart!');
}

function updateCartCount() {
    const cartCounts = document.querySelectorAll('.cart-count');
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].quantity || 1;
    }
    
    for (let i = 0; i < cartCounts.length; i++) {
        cartCounts[i].textContent = total;
    }
}

function removeFromCart(itemId, customizations = null) {
    let newCart = [];
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id !== itemId || 
            (customizations && JSON.stringify(cart[i].customizations) !== JSON.stringify(customizations))) {
            newCart.push(cart[i]);
        }
    }
    cart = newCart;
    saveToStorage();
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        loadCartPage();
    }
}

function updateQuantity(itemId, change, customizations = null) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === itemId && 
            (!customizations || JSON.stringify(cart[i].customizations) === JSON.stringify(customizations))) {
            cart[i].quantity = (cart[i].quantity || 1) + change;
            if (cart[i].quantity <= 0) {
                removeFromCart(itemId, customizations);
            } else {
                saveToStorage();
                if (window.location.pathname.includes('cart.html')) {
                    loadCartPage();
                }
            }
            break;
        }
    }
    updateCartCount();
}

// Modal functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('signupModal').style.display = 'none';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
    document.getElementById('loginModal').style.display = 'none';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

function switchToLogin() {
    closeSignupModal();
    openLoginModal();
}

// Authentication handlers
document.addEventListener('submit', function(e) {
    if (e.target.id === 'loginForm') {
        e.preventDefault();
        handleLogin(e);
    }
    if (e.target.id === 'signupForm') {
        e.preventDefault();
        handleSignup(e);
    }
});

function handleLogin(event) {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    let foundUser = null;
    
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email && users[i].password === password) {
            foundUser = users[i];
            break;
        }
    }
    
    if (foundUser) {
        currentUser = foundUser;
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        updateUIForLoggedInUser();
        closeLoginModal();
        showToast('Login successful!');
        
        if (window.location.pathname.includes('orders.html')) {
            loadOrdersPage();
        }
    } else {
        showToast('Invalid email or password!', 'error');
    }
}

function handleSignup(event) {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const address = document.getElementById('signupAddress').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            showToast('Email already registered!', 'error');
            return;
        }
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        address: address,
        preferences: [],
        orderHistory: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    updateUIForLoggedInUser();
    closeSignupModal();
    showToast('Account created successfully!');
    
    if (window.location.pathname.includes('orders.html')) {
        loadOrdersPage();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    appliedCoupon = null;
    updateUIForLoggedOutUser();
    showToast('Logged out successfully');
    
    if (window.location.pathname.includes('orders.html')) {
        loadOrdersPage();
    }
    if (window.location.pathname.includes('cart.html')) {
        loadCartPage();
    }
}

function updateUIForLoggedInUser() {
    const navAuth = document.getElementById('navAuth');
    if (navAuth && currentUser) {
        navAuth.innerHTML = `
            <span class="user-name">Hi, ${currentUser.name}</span>
            <div class="user-dropdown">
                <button class="btn-login" onclick="logout()">Logout</button>
                <button class="btn-login" onclick="viewProfile()">Profile</button>
            </div>
        `;
    }
}

function updateUIForLoggedOutUser() {
    const navAuth = document.getElementById('navAuth');
    if (navAuth) {
        navAuth.innerHTML = `
            <button class="btn-login" onclick="openLoginModal()">Login</button>
            <button class="btn-signup" onclick="openSignupModal()">Sign Up</button>
        `;
    }
}

// View profile
function viewProfile() {
    if (!currentUser) return;
    
    alert(`Profile:
Name: ${currentUser.name}
Email: ${currentUser.email}
Phone: ${currentUser.phone}
Address: ${currentUser.address}
Favorites: ${favorites.length} items`);
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? '#00b894' : '#d63031';
    toast.style.display = 'block';
    
    setTimeout(function() {
        toast.style.display = 'none';
    }, 3000);
}

// Mobile menu
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === signupModal) {
        closeSignupModal();
    }
}

// Menu page functions
let currentFilter = 'all';
let currentSort = 'default';

function loadMenuPage() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    // Get restaurant filter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantParam = urlParams.get('restaurant');
    
    let filteredItems = [];
    
    // Copy items based on filters
    for (let i = 0; i < menuItems.length; i++) {
        let include = true;
        
        if (restaurantParam && menuItems[i].restaurantId != restaurantParam) {
            include = false;
        }
        
        if (currentFilter !== 'all' && menuItems[i].categoryId != currentFilter) {
            include = false;
        }
        
        if (include) {
            filteredItems.push(menuItems[i]);
        }
    }

    // Apply sort
    if (currentSort === 'price-low') {
        filteredItems.sort(function(a, b) { return a.price - b.price; });
    } else if (currentSort === 'price-high') {
        filteredItems.sort(function(a, b) { return b.price - a.price; });
    } else if (currentSort === 'rating') {
        filteredItems.sort(function(a, b) { return b.rating - a.rating; });
    } else if (currentSort === 'name') {
        filteredItems.sort(function(a, b) { 
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
    }

    if (filteredItems.length === 0) {
        menuGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">No items found</p>';
        return;
    }

    let html = '';
    for (let i = 0; i < filteredItems.length; i++) {
        const item = filteredItems[i];
        const isFavorite = favorites.includes(item.id);
        html += `
            <div class="menu-card">
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-info">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${item.name}</h3>
                        <i class="fas fa-heart ${isFavorite ? 'favorite' : ''}" 
                           onclick="toggleFavorite(${item.id})" 
                           style="color: ${isFavorite ? '#ff6b6b' : '#ddd'}; cursor: pointer;"></i>
                    </div>
                    <p>${item.description}</p>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="rating">⭐ ${item.rating} (${item.totalRatings})</span>
                        <span class="veg-badge ${item.isVeg ? 'veg' : 'non-veg'}">${item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                    </div>
                    <div class="menu-footer">
                        <span class="price">₹${item.price}</span>
                        <button class="add-to-cart" onclick="openCustomizationModal(${item.id})">
                            <i class="fas fa-shopping-cart"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    menuGrid.innerHTML = html;
}

function filterMenu(categoryId) {
    currentFilter = categoryId;
    
    const buttons = document.querySelectorAll('.filter-btn');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    event.target.classList.add('active');
    
    loadMenuPage();
}

function sortMenu(sortBy) {
    currentSort = sortBy;
    loadMenuPage();
}

// Cart page functions
function loadCartPage() {
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) return;
    
    if (!cart || cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                <i class="fas fa-shopping-cart" style="font-size: 4rem; color: #ddd;"></i>
                <h2 style="color: #666; margin: 1rem 0;">Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <div style="margin-top: 2rem;">
                    <a href="menu.html" style="display: inline-block; padding: 1rem 2rem; background: var(--primary-color); color: white; text-decoration: none; border-radius: 5px; margin-right: 1rem;">Browse Menu</a>
                    <a href="favorites.html" style="display: inline-block; padding: 1rem 2rem; background: var(--secondary-color); color: white; text-decoration: none; border-radius: 5px;">View Favorites</a>
                </div>
            </div>
        `;
        return;
    }

    let subtotal = 0;
    let cartItemsHtml = '';
    let itemCount = 0;
    
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const quantity = item.quantity || 1;
        const itemPrice = item.finalPrice || item.price;
        const itemTotal = itemPrice * quantity;
        subtotal += itemTotal;
        itemCount += quantity;
        
        let customizationsHtml = '';
        if (item.customizations && item.customizations.length > 0) {
            customizationsHtml = `
                <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">
                    Extras: ${item.customizations.join(', ')}
                    ${item.extraPrice ? `(+₹${item.extraPrice})` : ''}
                </div>
            `;
        }
        
        cartItemsHtml += `
            <div style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; gap: 1rem;">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
                <div style="flex: 1;">
                    <h3 style="margin-bottom: 0.25rem;">${item.name}</h3>
                    <p style="color: #666; font-size: 0.9rem;">${item.description}</p>
                    ${customizationsHtml}
                    <span style="font-weight: bold; color: var(--primary-color);">₹${itemPrice}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="updateQuantity(${item.id}, -1, ${JSON.stringify(item.customizations)})" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer;">-</button>
                    <span style="font-weight: bold;">${quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1, ${JSON.stringify(item.customizations)})" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer;">+</button>
                    <i class="fas fa-trash" onclick="removeFromCart(${item.id}, ${JSON.stringify(item.customizations)})" style="color: #d63031; cursor: pointer; margin-left: 1rem;"></i>
                </div>
            </div>
        `;
    }

    // Apply coupon discount
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'flat') {
            discount = appliedCoupon.discount;
        } else if (appliedCoupon.type === 'percent') {
            discount = (subtotal * appliedCoupon.discount) / 100;
            if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
                discount = appliedCoupon.maxDiscount;
            }
        } else if (appliedCoupon.type === 'delivery') {
            discount = appliedCoupon.discount;
        }
    }

    const tax = subtotal * 0.1;
    const deliveryFee = appliedCoupon?.type === 'delivery' ? 0 : 99;
    const total = subtotal + tax + deliveryFee - discount;

    cartContainer.innerHTML = `
        <div>
            <div style="background: white; border-radius: 10px; padding: 1rem; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-bottom: 1rem;">
                <h3 style="margin-bottom: 1rem;">Cart Items (${itemCount})</h3>
                ${cartItemsHtml}
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 1rem; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 1rem;">Available Offers</h3>
                <div style="display: flex; gap: 1rem; overflow-x: auto; padding: 0.5rem;">
                    ${coupons.map(coupon => `
                        <div style="min-width: 200px; padding: 1rem; border: 1px solid #ddd; border-radius: 5px;">
                            <h4 style="color: var(--primary-color);">${coupon.code}</h4>
                            <p style="font-size: 0.9rem;">${coupon.description}</p>
                            <button onclick="applyCoupon('${coupon.code}')" style="width: 100%; padding: 0.5rem; background: var(--primary-color); color: white; border: none; border-radius: 5px; margin-top: 0.5rem; cursor: pointer;">Apply</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 5px 15px rgba(0,0,0,0.1); height: fit-content;">
            <h3 style="margin-bottom: 1rem;">Order Summary</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Subtotal (${itemCount} items)</span>
                <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Tax (10%)</span>
                <span>₹${tax.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Delivery Fee</span>
                <span>${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: green;">
                    <span>Discount (${appliedCoupon.code})</span>
                    <span>-₹${discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin: 1rem 0; font-size: 1.2rem; font-weight: bold; color: var(--primary-color); padding-top: 1rem; border-top: 1px solid #eee;">
                <span>Total</span>
                <span>₹${total.toFixed(2)}</span>
            </div>
            
            <div style="margin: 1rem 0;">
                <p style="color: #666; font-size: 0.9rem;">🕒 Estimated delivery: 30-40 minutes</p>
            </div>
            
            <button onclick="openCheckoutModal()" style="width: 100%; padding: 1rem; background: var(--primary-color); color: white; border: none; border-radius: 5px; font-size: 1.1rem; font-weight: 600; cursor: pointer;">
                Proceed to Checkout
            </button>
            
            <button onclick="clearCart()" style="width: 100%; padding: 0.5rem; background: transparent; color: var(--danger-color); border: 1px solid var(--danger-color); border-radius: 5px; margin-top: 1rem; cursor: pointer;">
                Clear Cart
            </button>
        </div>
    `;
}

// Clear cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        appliedCoupon = null;
        saveToStorage();
        updateCartCount();
        loadCartPage();
        showToast('Cart cleared');
    }
}

function openCheckoutModal() {
    if (!currentUser) {
        showToast('Please login to checkout', 'error');
        openLoginModal();
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'block';
        if (currentUser.address) {
            document.getElementById('deliveryAddress').value = currentUser.address;
        }
        if (currentUser.phone) {
            document.getElementById('phone').value = currentUser.phone;
        }
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function placeOrder(event) {
    event.preventDefault();
    
    // Calculate total with discounts
    let subtotal = 0;
    for (let i = 0; i < cart.length; i++) {
        subtotal += (cart[i].finalPrice || cart[i].price) * (cart[i].quantity || 1);
    }
    
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'flat') {
            discount = appliedCoupon.discount;
        } else if (appliedCoupon.type === 'percent') {
            discount = (subtotal * appliedCoupon.discount) / 100;
            if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
                discount = appliedCoupon.maxDiscount;
            }
        } else if (appliedCoupon.type === 'delivery') {
            discount = appliedCoupon.discount;
        }
    }
    
    const tax = subtotal * 0.1;
    const deliveryFee = appliedCoupon?.type === 'delivery' ? 0 : 99;
    const total = subtotal + tax + deliveryFee - discount;
    
    // Generate estimated delivery time
    const deliveryDate = new Date();
    deliveryDate.setMinutes(deliveryDate.getMinutes() + 35);
    const estimatedDelivery = deliveryDate.toLocaleTimeString();
    
    const order = {
        id: Date.now(),
        orderNumber: 'ORD' + Math.floor(Math.random() * 10000),
        items: JSON.parse(JSON.stringify(cart)),
        deliveryAddress: document.getElementById('deliveryAddress').value,
        phone: document.getElementById('phone').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        appliedCoupon: appliedCoupon,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        deliveryFee: deliveryFee,
        total: total,
        status: 'Confirmed',
        date: new Date().toISOString(),
        estimatedDelivery: estimatedDelivery,
        userId: currentUser ? currentUser.id : null
    };

    // Save order
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Update user's order history
    if (currentUser) {
        if (!currentUser.orderHistory) currentUser.orderHistory = [];
        currentUser.orderHistory.push(order.id);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Clear cart
    cart = [];
    appliedCoupon = null;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    closeCheckoutModal();
    showToast('Order placed successfully!');
    
    // Show order confirmation
    setTimeout(function() {
        if (confirm('Order placed! Track your order now?')) {
            window.location.href = 'orders.html';
        }
    }, 1500);
}

// Orders page function
function loadOrdersPage() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;

    if (!currentUser) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-shopping-bag" style="font-size: 4rem; color: #ddd;"></i>
                <h2 style="color: #666; margin: 1rem 0;">Please login to view your orders</h2>
                <button onclick="openLoginModal()" style="padding: 1rem 2rem; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">Login</button>
            </div>
        `;
        return;
    }

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    let userOrders = [];
    
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].userId === currentUser.id) {
            userOrders.push(orders[i]);
        }
    }

    if (userOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-shopping-bag" style="font-size: 4rem; color: #ddd;"></i>
                <h2 style="color: #666; margin: 1rem 0;">No orders yet</h2>
                <p>Looks like you haven't placed any orders.</p>
                <div style="margin-top: 2rem;">
                    <a href="menu.html" style="display: inline-block; padding: 1rem 2rem; background: var(--primary-color); color: white; text-decoration: none; border-radius: 5px; margin-right: 1rem;">Browse Menu</a>
                    <a href="favorites.html" style="display: inline-block; padding: 1rem 2rem; background: var(--secondary-color); color: white; text-decoration: none; border-radius: 5px;">View Favorites</a>
                </div>
            </div>
        `;
        return;
    }

    // Add filter buttons
    let filterHtml = `
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
            <button onclick="filterOrders('all')" class="filter-btn active">All Orders</button>
            <button onclick="filterOrders('pending')" class="filter-btn">Pending</button>
            <button onclick="filterOrders('delivered')" class="filter-btn">Delivered</button>
            <button onclick="filterOrders('cancelled')" class="filter-btn">Cancelled</button>
        </div>
    `;

    let html = filterHtml;
    for (let i = userOrders.length - 1; i >= 0; i--) {
        const order = userOrders[i];
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let itemsHtml = '';
        for (let j = 0; j < order.items.length; j++) {
            const item = order.items[j];
            itemsHtml += `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; color: #666;">
                    <div>
                        <span>${item.name}</span>
                        ${item.customizations ? `<span style="font-size: 0.8rem; color: #999; display: block;">${item.customizations.join(', ')}</span>` : ''}
                    </div>
                    <div>
                        <span>₹${((item.finalPrice || item.price) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                </div>
            `;
        }

        let statusColor = order.status === 'Delivered' ? '#00b894' : 
                         order.status === 'Cancelled' ? '#d63031' : 
                         order.status === 'Preparing' ? '#fdcb6e' : '#0984e3';

        html += `
            <div class="order-card" style="background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <span style="font-weight: bold; color: var(--primary-color);">${order.orderNumber || '#' + order.id}</span>
                        <span style="color: #999; margin-left: 1rem; font-size: 0.9rem;">${formattedDate}</span>
                    </div>
                    <span style="padding: 0.5rem 1rem; border-radius: 20px; background: ${statusColor}20; color: ${statusColor}; font-weight: 500;">
                        ${order.status}
                    </span>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    ${itemsHtml}
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #eee;">
                    <div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--primary-color);">₹${order.total.toFixed(2)}</div>
                        <div style="color: #666; font-size: 0.9rem;">Paid via ${order.paymentMethod}</div>
                        ${order.estimatedDelivery ? `<div style="color: #666; font-size: 0.9rem;">🕒 Est: ${order.estimatedDelivery}</div>` : ''}
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="trackOrderDetails('${order.id}')" style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Track
                        </button>
                        <button onclick="reorderItems(${order.id})" style="padding: 0.5rem 1rem; background: var(--secondary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Reorder
                        </button>
                        <button onclick="downloadInvoice(${order.id})" style="padding: 0.5rem 1rem; background: transparent; border: 1px solid #ddd; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    ordersContainer.innerHTML = html;
}

// Filter orders
function filterOrders(status) {
    // Update active button
    const buttons = document.querySelectorAll('.filter-btn');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    event.target.classList.add('active');
    
    // Reload with filter
    loadOrdersPage();
}

// Reorder items
function reorderItems(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        cart = JSON.parse(JSON.stringify(order.items));
        saveToStorage();
        updateCartCount();
        showToast('Items added to cart!');
        window.location.href = 'cart.html';
    }
}

// Download invoice
function downloadInvoice(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        const invoice = `
Order Invoice
=============
Order #: ${order.orderNumber}
Date: ${new Date(order.date).toLocaleString()}
Status: ${order.status}

Items:
${order.items.map(item => `- ${item.name} x${item.quantity || 1}: ₹${((item.finalPrice || item.price) * (item.quantity || 1)).toFixed(2)}`).join('\n')}

Subtotal: ₹${order.subtotal.toFixed(2)}
Discount: ₹${order.discount?.toFixed(2) || '0.00'}
Tax: ₹${order.tax.toFixed(2)}
Delivery: ₹${order.deliveryFee.toFixed(2)}
Total: ₹${order.total.toFixed(2)}

Delivery Address: ${order.deliveryAddress}
Phone: ${order.phone}
Payment Method: ${order.paymentMethod}

Thank you for ordering!
        `;
        
        // Create download link
        const blob = new Blob([invoice], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${order.orderNumber}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Track order details
function trackOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    let statusSteps = [
        { name: 'Order Placed', time: order.date, completed: true },
        { name: 'Order Confirmed', time: order.date, completed: order.status !== 'Pending' },
        { name: 'Preparing', time: order.date, completed: order.status === 'Preparing' || order.status === 'Out for Delivery' || order.status === 'Delivered' },
        { name: 'Out for Delivery', time: order.estimatedDelivery, completed: order.status === 'Out for Delivery' || order.status === 'Delivered' },
        { name: 'Delivered', time: order.status === 'Delivered' ? new Date().toLocaleString() : null, completed: order.status === 'Delivered' }
    ];
    
    let timelineHtml = '<div style="padding: 1rem;">';
    for (let i = 0; i < statusSteps.length; i++) {
        const step = statusSteps[i];
        timelineHtml += `
            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                <div style="width: 30px; height: 30px; border-radius: 50%; background: ${step.completed ? 'var(--primary-color)' : '#ddd'}; margin-right: 1rem;"></div>
                <div>
                    <div style="font-weight: ${step.completed ? 'bold' : 'normal'};">${step.name}</div>
                    ${step.time ? `<div style="font-size: 0.8rem; color: #666;">${step.time}</div>` : ''}
                </div>
            </div>
        `;
    }
    timelineHtml += '</div>';
    
    // Show timeline modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Track Order #${order.orderNumber}</h2>
            ${timelineHtml}
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

/*******************************************
 * END OF JAVASCRIPT CODE
 *******************************************/