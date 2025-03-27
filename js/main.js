// Main JavaScript file
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    UI.init();
    Auth.init();
    Chat.init();
    Admin.init();
});

// API utility class
class API {
    static BASE_URL = ''; // Change this to your API URL

    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                ...options,
                headers
            });
            
            // Handle 401 Unauthorized
            if (response.status === 401) {
                // Token expired or invalid
                Auth.logout();
                return null;
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Something went wrong');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        return await fetch(`${this.BASE_URL}/token`, {
            method: 'POST',
            body: formData
        }).then(res => res.json());
    }

    static async register(userData) {
        return await this.request(`/register?username=${userData.username}&password=${userData.password}&email=${userData.email}&full_name=${userData.fullName || ""}`, {
            method: 'POST'
        });
    }

    static async getCurrentUser() {
        return await this.request('/users/me');
    }

    static async getChats() {
        return await this.request('/chats');
    }

    static async getChatMessages(chatId) {
        return await this.request(`/chats/${chatId}/messages`);
    }

    static async createChat(userId) {
        return await this.request('/chats', {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    static async updateChatTitle(chatId, userId, title) {
        return await this.request(`/chats/${chatId}`, {
            method: 'PATCH',
            body: JSON.stringify({ userId, title })
        });
    }

    static async sendMessage(userId, chatId, message) {
        return await this.request('/chat', {
            method: 'POST',
            body: JSON.stringify({ userId, chatId, message })
        });
    }

    // Admin API calls
    static async getUsers() {
        return await this.request('/admin/users');
    }
}