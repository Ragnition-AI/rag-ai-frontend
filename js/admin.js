// Admin JavaScript file
const Admin = {
    users: [],
    
    init() {
        // Admin section navigation
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', this.switchAdminSection.bind(this));
        });
        
        // Check if user is admin when admin page is shown
        document.getElementById('admin-link').addEventListener('click', this.checkAdminAccess.bind(this));
    },
    
    async checkAdminAccess() {
        if (!Auth.currentUser || !Auth.currentUser.is_admin) {
            UI.showNotification('You do not have admin access', 'error');
            UI.showPage('chat-page');
            return false;
        }
        
        // Load admin data
        await this.loadUsers();
        return true;
    },
    
    switchAdminSection(e) {
        e.preventDefault();
        
        const targetSection = e.currentTarget.dataset.section;
        
        // Remove active class from all nav items and sections
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Add active class to clicked item and corresponding section
        e.currentTarget.classList.add('active');
        document.getElementById(`${targetSection}-section`).classList.add('active');
    },
    
    async loadUsers() {
        try {
            UI.showLoading();
            
            const users = await API.getUsers();
            this.users = users || [];
            
            // Render users table
            this.renderUsersTable();
        } catch (error) {
            console.error('Failed to load users:', error);
            UI.showNotification('Failed to load users', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    renderUsersTable() {
        const tableBody = document.querySelector('#users-table tbody');
        tableBody.innerHTML = '';
        
        if (this.users.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" class="text-center">No users found</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        
        this.users.forEach(user => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email || '-'}</td>
                <td>${user.full_name || '-'}</td>
                <td>
                    <span class="status-badge ${user.disabled ? 'inactive' : 'active'}">
                        ${user.disabled ? 'Inactive' : 'Active'}
                    </span>
                </td>
                <td>
                    <span class="role-badge ${user.is_admin ? 'admin' : 'user'}">
                        ${user.is_admin ? 'Admin' : 'User'}
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="btn-icon user-action toggle-status" data-username="${user.username}" data-action="toggle-status">
                        <i class="fas ${user.disabled ? 'fa-user-check' : 'fa-user-slash'}"></i>
                    </button>
                    <button class="btn-icon user-action toggle-role" data-username="${user.username}" data-action="toggle-role">
                        <i class="fas ${user.is_admin ? 'fa-user' : 'fa-user-shield'}"></i>
                    </button>
                </td>
            `;
            
            // Add event listeners to action buttons
            setTimeout(() => {
                const toggleStatusBtn = row.querySelector('.toggle-status');
                const toggleRoleBtn = row.querySelector('.toggle-role');
                
                toggleStatusBtn.addEventListener('click', () => this.toggleUserStatus(user.username, user.disabled));
                toggleRoleBtn.addEventListener('click', () => this.toggleUserRole(user.username, user.is_admin));
            }, 0);
            
            tableBody.appendChild(row);
        });
    },
    
    async toggleUserStatus(username, currentStatus) {
        // For future implementation - would connect to an API endpoint
        try {
            UI.showLoading();
            
            // This is a placeholder for the actual API call
            // In a real implementation, you would call an API endpoint to toggle the user status
            console.log(`Toggling status for user ${username} from ${currentStatus ? 'Inactive' : 'Active'} to ${currentStatus ? 'Active' : 'Inactive'}`);
            
            // For demo purposes, we'll just update the UI
            const userIndex = this.users.findIndex(user => user.username === username);
            if (userIndex !== -1) {
                this.users[userIndex].disabled = !currentStatus;
                this.renderUsersTable();
            }
            
            UI.showNotification(`User ${username} is now ${currentStatus ? 'Active' : 'Inactive'}`, 'success');
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            UI.showNotification('Failed to update user status', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    async toggleUserRole(username, isAdmin) {
        // For future implementation - would connect to an API endpoint
        try {
            UI.showLoading();
            
            // This is a placeholder for the actual API call
            console.log(`Toggling role for user ${username} from ${isAdmin ? 'Admin' : 'User'} to ${isAdmin ? 'User' : 'Admin'}`);
            
            // For demo purposes, we'll just update the UI
            const userIndex = this.users.findIndex(user => user.username === username);
            if (userIndex !== -1) {
                this.users[userIndex].is_admin = !isAdmin;
                this.renderUsersTable();
            }
            
            UI.showNotification(`User ${username} is now ${isAdmin ? 'User' : 'Admin'}`, 'success');
        } catch (error) {
            console.error('Failed to toggle user role:', error);
            UI.showNotification('Failed to update user role', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    // Analytics section - placeholder for future implementation
    renderAnalytics() {
        // This would be implemented in the future
        console.log('Rendering analytics data');
    },
    
    // Settings section - placeholder for future implementation
    saveSettings(settings) {
        // This would be implemented in the future
        console.log('Saving settings:', settings);
    }
};