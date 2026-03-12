// js/admin-api.js
// This simulates API calls between frontend and admin

const AdminAPI = {
    // Base URL (for future backend integration)
    baseURL: '',  // Will be replaced with actual API URL when backend is added
    
    // Get all data for admin
    async getAllData() {
        return {
            users: JSON.parse(localStorage.getItem('users')) || [],
            orders: JSON.parse(localStorage.getItem('orders')) || [],
            menuItems: JSON.parse(localStorage.getItem('menuItems')) || menuItems,
            restaurants: JSON.parse(localStorage.getItem('restaurants')) || restaurantData,
            admins: JSON.parse(localStorage.getItem('admins')) || []
        };
    },
    
    // Update restaurant
    async updateRestaurant(restaurantId, data) {
        const restaurants = JSON.parse(localStorage.getItem('restaurants')) || restaurantData;
        const index = restaurants.findIndex(r => r.id === restaurantId);
        if (index !== -1) {
            restaurants[index] = { ...restaurants[index], ...data };
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            return { success: true, data: restaurants[index] };
        }
        return { success: false, error: 'Restaurant not found' };
    },
    
    // Update menu item
    async updateMenuItem(itemId, data) {
        const menuItems = JSON.parse(localStorage.getItem('menuItems')) || menuItemsData;
        const index = menuItems.findIndex(i => i.id === itemId);
        if (index !== -1) {
            menuItems[index] = { ...menuItems[index], ...data };
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            return { success: true, data: menuItems[index] };
        }
        return { success: false, error: 'Item not found' };
    },
    
    // Update order status
    async updateOrderStatus(orderId, status) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].status = status;
            localStorage.setItem('orders', JSON.stringify(orders));
            return { success: true, data: orders[index] };
        }
        return { success: false, error: 'Order not found' };
    },
    
    // Get analytics
    async getAnalytics() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Calculate analytics
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        
        // Group orders by date
        const ordersByDate = {};
        orders.forEach(order => {
            const date = new Date(order.date).toLocaleDateString();
            ordersByDate[date] = (ordersByDate[date] || 0) + 1;
        });
        
        return {
            totalOrders: orders.length,
            totalUsers: users.length,
            totalRevenue: totalRevenue,
            averageOrderValue: averageOrderValue,
            ordersByDate: ordersByDate,
            popularItems: this.getPopularItems(orders)
        };
    },
    
    // Get popular items
    getPopularItems(orders) {
        const itemCount = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                itemCount[item.name] = (itemCount[item.name] || 0) + (item.quantity || 1);
            });
        });
        
        return Object.entries(itemCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }
};

// Load admin API
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin-dashboard.html')) {
        // Load API for admin dashboard
        window.AdminAPI = AdminAPI;
    }
});