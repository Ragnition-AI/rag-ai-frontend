// UI JavaScript file
const UI = {
    isLoading: false,
    isSidebarOpen: true,
    isDarkMode: false,
    activeNotification: null,
    activeModals: new Set(),
    
    init() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', this.toggleTheme.bind(this));
        document.getElementById('admin-theme-toggle').addEventListener('click', this.toggleTheme.bind(this));
        
        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', this.toggleSidebar.bind(this));
        
        // User menu
        document.getElementById('user-menu-btn').addEventListener('click', this.toggleUserMenu.bind(this));
        
        // Admin link
        document.getElementById('admin-link').addEventListener('click', () => this.showPage('admin-page'));
        
        // Back to chat from admin
        document.getElementById('back-to-chat').addEventListener('click', () => this.showPage('chat-page'));
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('user-menu-btn');
            const userDropdown = document.querySelector('.user-dropdown');
            
            if (!userMenu.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
        
        // Load theme preference
        this.loadThemePreference();
    },
    
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
        });
        
        // Show requested page
        document.getElementById(pageId).classList.remove('hidden');
        
        // Close user menu if open
        document.querySelector('.user-dropdown').classList.remove('active');
    },
    
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const chatArea = document.querySelector('.chat-area');
        
        this.isSidebarOpen = !this.isSidebarOpen;
        
        if (this.isSidebarOpen) {
            sidebar.classList.remove('collapsed');
            chatArea.classList.remove('expanded');
        } else {
            sidebar.classList.add('collapsed');
            chatArea.classList.add('expanded');
        }
    },
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        
        if (this.isDarkMode) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
            document.getElementById('admin-theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
            document.getElementById('admin-theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Save theme preference
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    },
    
    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark') {
            // Dark mode is not active by default
            this.toggleTheme();
        }
    },
    
    toggleUserMenu() {
        document.querySelector('.user-dropdown').classList.toggle('active');
    },
    
    showLoading() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        // Create loading overlay if not exists
        let loadingOverlay = document.getElementById('loading-overlay');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(loadingOverlay);
        }
        
        loadingOverlay.classList.add('active');
    },
    
    hideLoading() {
        this.isLoading = false;
        
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    },
    
    showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notification if any
        this.hideNotification();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">×</button>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Keep reference
        this.activeNotification = notification;
        
        // Add event listener to close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification();
        });
        
        // Show notification (with animation)
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Auto hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification();
            }, duration);
        }
    },
    
    hideNotification() {
        if (this.activeNotification) {
            this.activeNotification.classList.remove('active');
            
            setTimeout(() => {
                if (this.activeNotification && this.activeNotification.parentNode) {
                    this.activeNotification.parentNode.removeChild(this.activeNotification);
                }
                this.activeNotification = null;
            }, 300); // Transition duration
        }
    },
    
    getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle';
            case 'error':
                return 'fas fa-exclamation-circle';
            case 'warning':
                return 'fas fa-exclamation-triangle';
            case 'info':
            default:
                return 'fas fa-info-circle';
        }
    },
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        
        if (modal) {
            // Focus first input if exists
            setTimeout(() => {
                const firstInput = modal.querySelector('input, textarea, select');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
            
            // If it's the edit title modal, populate with current title
            if (modalId === 'edit-title-modal') {
                const currentTitle = document.getElementById('chat-title').textContent;
                document.getElementById('chat-title-input').value = currentTitle;
            }
            
            modal.classList.add('active');
            this.activeModals.add(modalId);
            
            // Disable scrolling on the body
            document.body.style.overflow = 'hidden';
        }
    },
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.classList.remove('active');
            this.activeModals.delete(modalId);
            
            // Re-enable scrolling if no other modals are open
            if (this.activeModals.size === 0) {
                document.body.style.overflow = '';
            }
        }
    },
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        this.activeModals.clear();
        document.body.style.overflow = '';
    }
};