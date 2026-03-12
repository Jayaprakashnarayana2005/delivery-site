// js/admin-connection.js
// This file connects the main website with admin panel

const AdminConnection = {
    // API endpoints (simulated with localStorage)
    endpoints: {
        users: 'localStorage',
        orders: 'localStorage',
        menu: 'localStorage',
        restaurants: 'localStorage'
    },

    // Initialize connection
    init: function() {
        console.log('Admin Connection Initialized');
        this.setupDataSync();
        this.checkAdminStatus();
    },

    // Setup data synchronization
    setupDataSync: function() {
        // Sync main website data with admin panel
        window.addEventListener('storage', (e) => {
            if (e.key === 'orders' || e.key === 'users' || e.key === 'menuItems') {
                this.syncWithAdmin(e.key, e.newValue);
            }
        });
    },

    // Sync data with admin panel
    syncWithAdmin: function(key, value) {
        console.log(`Syncing ${key} with admin panel`);
        // Trigger admin dashboard update if open
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
                type: 'dataSync',
                key: key,
                value: JSON.parse(value)
            }, '*');
        }
    },

    // Check if current user is admin
    checkAdminStatus: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const admins = JSON.parse(localStorage.getItem('admins')) || [];
        
        if (currentUser && admins.some(a => a.email === currentUser.email)) {
            this.showAdminBadge();
        }
    },

    // Show admin badge on website
    showAdminBadge: function() {
        const adminBadge = document.createElement('div');
        adminBadge.className = 'admin-badge';
        adminBadge.innerHTML = `
            <a href="admin-dashboard.html" class="admin-quick-link">
                <i class="fas fa-crown"></i> Admin Panel
            </a>
        `;
        document.body.appendChild(adminBadge);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .admin-badge {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }
            .admin-quick-link {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 12px 24px;
                border-radius: 50px;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                transition: transform 0.3s;
            }
            .admin-quick-link:hover {
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    },

    // Get data for admin panel
    getDataForAdmin: function(dataType) {
        switch(dataType) {
            case 'users':
                return JSON.parse(localStorage.getItem('users')) || [];
            case 'orders':
                return JSON.parse(localStorage.getItem('orders')) || [];
            case 'menu':
                return JSON.parse(localStorage.getItem('menuItems')) || menuItems;
            case 'restaurants':
                return JSON.parse(localStorage.getItem('restaurants')) || [];
            default:
                return [];
        }
    },

    // Push data from admin to main site
    pushDataToMain: function(dataType, data) {
        localStorage.setItem(dataType, JSON.stringify(data));
        // Trigger event to refresh main site if open
        window.dispatchEvent(new StorageEvent('storage', {
            key: dataType,
            newValue: JSON.stringify(data)
        }));
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    AdminConnection.init();
});