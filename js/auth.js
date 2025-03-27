// Auth JavaScript file
const Auth = {
    currentUser: null,
    
    init() {
        // Login form submission
        document.getElementById('login-form').addEventListener('submit', this.handleLogin.bind(this));
        
        // Register form submission
        document.getElementById('register-form').addEventListener('submit', this.handleRegister.bind(this));
        
        // Logout link
        document.getElementById('logout-link').addEventListener('click', this.logout.bind(this));
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', this.switchTab.bind(this));
        });
        
        // Check if user is already logged in
        this.checkAuth();
    },
    
    switchTab(e) {
        const targetTab = e.target.dataset.tab;
        
        // Remove active class from all tabs and forms
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Add active class to clicked tab and corresponding form
        e.target.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    },
    
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        
        if (!username || !password) {
            errorEl.textContent = 'Please enter both username and password.';
            return;
        }
        
        try {
            UI.showLoading();
            
            const data = await API.login(username, password);
            
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                
                // Get current user info
                await this.fetchCurrentUser();
                
                // Switch to chat page
                UI.showPage('chat-page');
                
                // Load chats
                Chat.loadChats();
            } else {
                errorEl.textContent = 'Invalid username or password.';
            }
        } catch (error) {
            errorEl.textContent = error.message || 'Login failed. Please try again.';
        } finally {
            UI.hideLoading();
        }
    },
    
    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const fullName = document.getElementById('register-fullname').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        const errorEl = document.getElementById('register-error');
        
        if (!username || !email || !password || !confirmPassword) {
            errorEl.textContent = 'Please fill all required fields.';
            return;
        }
        
        if (password !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match.';
            return;
        }
        
        try {
            UI.showLoading();
            
            const userData = {
                username,
                email,
                fullName,
                password
            };
            
            await API.register(userData);
            
            // Switch to login tab
            document.querySelector('.tab-btn[data-tab="login-form"]').click();
            
            // Show success message
            document.getElementById('login-error').innerHTML = '<span style="color: var(--success-color)">Registration successful. Please login.</span>';
            
            // Clear register form
            document.getElementById('register-form').reset();
        } catch (error) {
            errorEl.textContent = error.message || 'Registration failed. Please try again.';
        } finally {
            UI.hideLoading();
        }
    },
    
    async fetchCurrentUser() {
        try {
            const user = await API.getCurrentUser();
            
            if (user) {
                this.currentUser = user;
                document.getElementById('username-display').textContent = user.username;
                
                // Show/hide admin link based on user role
                if (user.is_admin) {
                    document.getElementById('admin-link').classList.remove('hidden');
                } else {
                    document.getElementById('admin-link').classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    },
    
    async checkAuth() {
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                await this.fetchCurrentUser();
                
                if (this.currentUser) {
                    // User is authenticated
                    UI.showPage('chat-page');
                    
                    // Load chats
                    Chat.loadChats();
                } else {
                    // Invalid token
                    this.logout();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                this.logout();
            }
        }
    },
    
    logout() {
        localStorage.removeItem('token');
        this.currentUser = null;
        
        // Clear chat state
        Chat.currentChatId = null;
        
        // Back to login page
        UI.showPage('login-page');
    }
};