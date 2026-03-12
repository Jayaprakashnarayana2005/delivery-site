// Add at the beginning of admin-dashboard.js
// Listen for messages from main website
window.addEventListener('message', (event) => {
    if (event.data.type === 'dataSync') {
        console.log('Received sync from main site:', event.data);
        refreshDashboardData(event.data.key);
    }
});

// Listen for storage events (when main site updates data)
window.addEventListener('storage', (e) => {
    console.log('Storage changed:', e.key);
    refreshDashboardData(e.key);
});

// Function to refresh dashboard data
function refreshDashboardData(dataType) {
    switch(dataType) {
        case 'orders':
            loadRecentOrders();
            updateOrderStats();
            break;
        case 'users':
            loadUsers();
            updateUserStats();
            break;
        case 'menuItems':
            loadMenuItems();
            break;
        case 'restaurants':
            loadRestaurants();
            break;
    }
}

// Update loadRecentOrders function
function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const recentOrdersBody = document.getElementById('recentOrdersTable');
    
    if (recentOrdersBody) {
        recentOrdersBody.innerHTML = orders.slice(-5).reverse().map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${getCustomerName(order.userId)}</td>
                <td>${getRestaurantFromOrder(order)}</td>
                <td>₹${order.total}</td>
                <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                <td><button class="action-btn" onclick="viewOrderDetails(${order.id})">View</button></td>
            </tr>
        `).join('');
    }
}

// Helper functions
function getCustomerName(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Guest User';
}

function getRestaurantFromOrder(order) {
    if (order.items && order.items[0]) {
        const menuItems = JSON.parse(localStorage.getItem('menuItems')) || menuItemsData;
        const item = menuItems.find(i => i.id === order.items[0].id);
        return item ? getRestaurantName(item.restaurantId) : 'Unknown';
    }
    return 'Unknown';
}

// Add real-time stats update
function updateOrderStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.date).toDateString() === today);
    
    document.getElementById('todayOrders').textContent = todayOrders.length;
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('todayRevenue').textContent = '₹' + todayRevenue.toFixed(2);
}

// Add notification for new orders
function notifyNewOrder(order) {
    // Show notification in admin panel
    const notificationArea = document.querySelector('.notification-icon');
    if (notificationArea) {
        const badge = notificationArea.querySelector('.notification-badge');
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        
        // Show toast notification
        showAdminNotification(`New Order #${order.id} received!`);
    }
}

function showAdminNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
// Admin Dashboard JavaScript

let currentAdmin = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (!savedAdmin) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    currentAdmin = JSON.parse(savedAdmin);
    
    // Update admin info in UI
    document.getElementById('adminName').textContent = currentAdmin.name;
    document.getElementById('adminRole').textContent = 
        currentAdmin.role === 'super_admin' ? 'Super Admin' : 
        currentAdmin.role === 'admin' ? 'Admin' : 
        currentAdmin.role === 'restaurant_owner' ? 'Restaurant Owner' : 'Delivery Partner';
    document.getElementById('adminNameSmall').textContent = currentAdmin.name;
    
    // Load dashboard data
    loadDashboardData();
    loadRestaurants();
    loadMenuItems();
    loadUsers();
    
    // Initialize charts
    initCharts();
});

// Switch dashboard tabs
function switchDashboardTab(tab) {
    // Remove active class from all tabs and menu items
    document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu li').forEach(item => item.classList.remove('active'));
    
    // Add active class to selected tab and menu item
    document.getElementById(tab + 'Tab').classList.add('active');
    event.currentTarget.classList.add('active');
}

// Toggle sidebar
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

// Logout admin
function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentAdmin');
        window.location.href = 'admin-login.html';
    }
}

// Load dashboard data
function loadDashboardData() {
    // Load restaurants count
    const restaurants = JSON.parse(localStorage.getItem('restaurants')) || [];
    document.getElementById('totalRestaurants').textContent = restaurants.length;
    
    // Load menu items count
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || menuItemsData;
    document.getElementById('totalMenuItems').textContent = menuItems.length;
    
    // Load orders
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.date).toDateString() === today);
    document.getElementById('todayOrders').textContent = todayOrders.length;
    
    // Load users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    document.getElementById('totalUsers').textContent = users.length;
    
    // Calculate today's revenue
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('todayRevenue').textContent = '₹' + todayRevenue.toFixed(2);
    
    // Load active deliveries
    const activeDeliveries = orders.filter(o => o.status === 'Out for Delivery').length;
    document.getElementById('activeDeliveries').textContent = activeDeliveries;
}

// Initialize charts
function initCharts() {
    // Orders Chart
    const ctx1 = document.getElementById('ordersChart').getContext('2d');
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Orders',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Revenue Chart
    const ctx2 = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Delivery', 'Tax'],
            datasets: [{
                data: [30000, 5000, 8000],
                backgroundColor: ['#667eea', '#4facfe', '#43e97b']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load restaurants
function loadRestaurants() {
    const restaurants = JSON.parse(localStorage.getItem('restaurants')) || restaurantData;
    const tbody = document.getElementById('restaurantsTable');
    
    if (!tbody) return;
    
    tbody.innerHTML = restaurants.map(r => `
        <tr>
            <td>#${r.id}</td>
            <td>${r.name}</td>
            <td>${r.cuisine}</td>
            <td>⭐ ${r.rating || '4.5'}</td>
            <td>${r.totalOrders || '156'}</td>
            <td><span class="status-badge ${r.status === 'active' ? 'delivered' : 'pending'}">${r.status || 'active'}</span></td>
            <td>
                <button class="action-btn" onclick="editRestaurant(${r.id})">Edit</button>
                <button class="action-btn" onclick="deleteRestaurant(${r.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Load menu items
function loadMenuItems() {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || menuItemsData;
    const tbody = document.getElementById('menuTable');
    
    if (!tbody) return;
    
    tbody.innerHTML = menuItems.map(item => `
        <tr>
            <td><img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
            <td>${item.name}</td>
            <td>${getRestaurantName(item.restaurantId)}</td>
            <td>${getCategoryName(item.categoryId)}</td>
            <td>₹${item.price}</td>
            <td><span class="status-badge delivered">Active</span></td>
            <td>
                <button class="action-btn" onclick="editMenuItem(${item.id})">Edit</button>
                <button class="action-btn" onclick="deleteMenuItem(${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Load users
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('usersTable');
    
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>#${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.orders || '0'}</td>
            <td>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
            <td>
                <button class="action-btn" onclick="viewUser(${user.id})">View</button>
                <button class="action-btn" onclick="blockUser(${user.id})">Block</button>
            </td>
        </tr>
    `).join('');
}

// Helper functions
function getRestaurantName(restaurantId) {
    const restaurants = JSON.parse(localStorage.getItem('restaurants')) || restaurantData;
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : 'Unknown';
}

function getCategoryName(categoryId) {
    const categories = {
        1: 'Pizza',
        2: 'Burgers',
        3: 'Sushi',
        4: 'Pasta'
    };
    return categories[categoryId] || 'Other';
}

// Modal functions
function showAddRestaurantModal() {
    // Populate modal with restaurant data
    document.getElementById('addRestaurantModal').style.display = 'block';
}

function showAddMenuItemModal() {
    // Populate restaurant dropdown
    const select = document.getElementById('menuRestaurantId');
    const restaurants = JSON.parse(localStorage.getItem('restaurants')) || restaurantData;
    
    select.innerHTML = '<option value="">Select Restaurant</option>' + 
        restaurants.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    
    document.getElementById('addMenuItemModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Add restaurant
function addRestaurant(event) {
    event.preventDefault();
    
    const restaurants = JSON.parse(localStorage.getItem('restaurants')) || restaurantData;
    
    const newRestaurant = {
        id: restaurants.length + 1,
        name: document.getElementById('restaurantName').value,
        cuisine: document.getElementById('restaurantCuisine').value,
        description: document.getElementById('restaurantDescription').value,
        image: document.getElementById('restaurantImage').value,
        minOrder: parseInt(document.getElementById('restaurantMinOrder').value),
        deliveryTime: document.getElementById('restaurantDeliveryTime').value,
        rating: 4.5,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    restaurants.push(newRestaurant);
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
    
    closeModal('addRestaurantModal');
    loadRestaurants();
    alert('Restaurant added successfully!');
}

// Add menu item
function addMenuItem(event) {
    event.preventDefault();
    
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || menuItemsData;
    
    const newItem = {
        id: menuItems.length + 1,
        restaurantId: parseInt(document.getElementById('menuRestaurantId').value),
        categoryId: parseInt(document.getElementById('menuCategoryId').value),
        name: document.getElementById('menuItemName').value,
        description: document.getElementById('menuItemDescription').value,
        price: parseInt(document.getElementById('menuItemPrice').value),
        image: document.getElementById('menuItemImage').value,
        isVeg: document.getElementById('menuItemVeg').checked,
        rating: 4.5,
        totalRatings: 0
    };
    
    menuItems.push(newItem);
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    
    closeModal('addMenuItemModal');
    loadMenuItems();
    alert('Menu item added successfully!');
}

// Generate report
function generateReport() {
    const restaurants = JSON.parse(localStorage.getItem('restaurants')) || restaurantData;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const report = `
================================
FOODIEEXPRESS ADMIN REPORT
================================
Date: ${new Date().toLocaleString()}
Generated By: ${currentAdmin.name}

SUMMARY STATISTICS
--------------------------------
Total Restaurants: ${restaurants.length}
Total Menu Items: ${menuItemsData.length}
Total Users: ${users.length}
Total Orders: ${orders.length}
Total Revenue: ₹${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}

TOP RESTAURANTS
--------------------------------
${restaurants.slice(0, 5).map(r => `${r.name}: ⭐ ${r.rating || 4.5}`).join('\n')}

RECENT ORDERS
--------------------------------
${orders.slice(-5).map(o => `#${o.id}: ₹${o.total} - ${o.status}`).join('\n')}

================================
    `;
    
    // Download report
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_report_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Sample data
const restaurantData = [
    { id: 1, name: 'Pizza Paradise', cuisine: 'Italian', rating: 4.5, status: 'active' },
    { id: 2, name: 'Burger King', cuisine: 'American', rating: 4.3, status: 'active' },
    { id: 3, name: 'Sushi Master', cuisine: 'Japanese', rating: 4.7, status: 'active' },
    { id: 4, name: 'Pasta House', cuisine: 'Italian', rating: 4.4, status: 'active' }
];

const menuItemsData = [
    { id: 1, restaurantId: 1, categoryId: 1, name: 'Margherita Pizza', price: 499, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500' },
    { id: 2, restaurantId: 2, categoryId: 2, name: 'Classic Burger', price: 299, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500' },
    { id: 3, restaurantId: 3, categoryId: 3, name: 'California Roll', price: 599, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500' },
    { id: 4, restaurantId: 4, categoryId: 4, name: 'Carbonara Pasta', price: 449, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500' }
];