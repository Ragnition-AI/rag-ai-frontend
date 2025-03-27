// Chat JavaScript file
const Chat = {
    currentChatId: null,
    messages: [],
    chats: [],
    
    init() {
        // Initialize event listeners
        document.getElementById('new-chat-btn').addEventListener('click', this.createNewChat.bind(this));
        document.getElementById('message-form').addEventListener('submit', this.sendMessage.bind(this));
        document.getElementById('edit-title-btn').addEventListener('click', () => UI.openModal('edit-title-modal'));
        document.getElementById('save-title-btn').addEventListener('click', this.updateChatTitle.bind(this));
        
        // Handle auto-expanding textarea
        const messageInput = document.getElementById('message-input');
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            // Reset height if empty
            if (this.value.length === 0) {
                this.style.height = '';
            }
        });
    },
    
    async loadChats() {
        try {
            UI.showLoading();
            
            const chats = await API.getChats();
            this.chats = chats || [];
            
            // Render chats in sidebar
            this.renderChatList();
            
            // If we have chats, load the first one
            if (this.chats.length > 0) {
                this.loadChat(this.chats[0].id);
            } else {
                // No chats, show empty state
                document.getElementById('empty-state').classList.remove('hidden');
                document.getElementById('chat-container').classList.add('hidden');
            }
        } catch (error) {
            console.error('Failed to load chats:', error);
            UI.showNotification('Failed to load chats', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    renderChatList() {
        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = '';
        
        this.chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.chatId = chat.id;
            
            if (this.currentChatId === chat.id) {
                chatItem.classList.add('active');
            }
            
            chatItem.innerHTML = `
                <div class="chat-info">
                    <div class="chat-title">${chat.title || 'New Conversation'}</div>
                    <div class="hat-preview">${chat.lastMessage || 'No messages yet'}</div>
                </div>
            `;
            
            chatItem.addEventListener('click', () => this.loadChat(chat.id));
            chatList.appendChild(chatItem);
        });
    },
    
    async loadChat(chatId) {
        try {
            UI.showLoading();
            
            // Set current chat ID
            this.currentChatId = chatId;
            
            // Update active chat in sidebar
            document.querySelectorAll('.chat-item').forEach(item => {
                if (item.dataset.chatId === chatId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            //Sidebar
            // Get chat messages
            const messages = await API.getChatMessages(chatId);
            this.messages = messages || [];
            
            // Get current chat
            const currentChat = this.chats.find(chat => chat.id === chatId);
            
            // Update chat title
            document.getElementById('chat-title').textContent = currentChat?.title || 'New Conversation';
            
            // Show chat container, hide empty state
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('chat-container').classList.remove('hidden');
            
            // Render messages
            this.renderMessages();
        } catch (error) {
            console.error('Failed to load chat:', error);
            UI.showNotification('Failed to load chat', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    renderMessages() {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML = '';
        
        if (this.messages.length === 0) {
            // No messages yet
            return;
        }
        
        this.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.role === 'human' ? 'user-message' : 'assistant-message'}`;
            
            // Format message content
            let formattedContent = message.content;
            
            // Basic Markdown processing
            // Convert code blocks
            formattedContent = formattedContent.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            
            // Convert inline code
            formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // Convert bold
            formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            
            // Convert italic
            formattedContent = formattedContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            
            // Convert links
            formattedContent = formattedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
            
            // Convert line breaks to <br>
            formattedContent = formattedContent.replace(/\n/g, '<br>');
            
            messageElement.innerHTML = `
                <div class="message-bubble">
                    <div class="message-content">${formattedContent}</div>
                    <div class="message-time">${this.formatTimestamp(message.timestamp)}</div>
                </div>
            `;
            
            messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        this.scrollToBottom();
    },
    
    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    async createNewChat() {
        try {
            if (!Auth.currentUser) return;
            
            UI.showLoading();
            
            const response = await API.createChat(Auth.currentUser.username);
            
            if (response && response.id) {
                // Add new chat to list
                const newChat = {
                    id: response.id,
                    title: 'New Conversation',
                    userId: Auth.currentUser.username,
                    createdAt: new Date().toISOString(),
                    lastMessage: null
                };
                
                this.chats.unshift(newChat);
                
                // Render chat list
                this.renderChatList();
                
                // Load the new chat
                this.loadChat(newChat.id);
            }
        } catch (error) {
            console.error('Failed to create new chat:', error);
            UI.showNotification('Failed to create new chat', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    async sendMessage(e) {
        e.preventDefault();
        
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message || !this.currentChatId || !Auth.currentUser) return;
        
        try {
            // Clear input
            messageInput.value = '';
            messageInput.style.height = '';
            
            // Add user message to UI immediately
            const userMessage = {
                id: Date.now().toString(),
                chatId: this.currentChatId,
                role: 'human',
                content: message,
                timestamp: new Date().toISOString()
            };
            
            this.messages.push(userMessage);
            this.renderMessages();
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Send message to API
            const response = await API.sendMessage(Auth.currentUser.username, this.currentChatId, message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            if (response && response.response) {
                // Add assistant message to UI
                const assistantMessage = {
                    id: Date.now().toString() + 1,
                    chatId: this.currentChatId,
                    role: 'assistant',
                    content: response.response,
                    timestamp: new Date().toISOString()
                };
                
                this.messages.push(assistantMessage);
                this.renderMessages();
                
                // Update chat preview in sidebar
                this.updateChatPreview(this.currentChatId, message);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            UI.showNotification('Failed to send message', 'error');
            this.hideTypingIndicator();
        }
    },
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('messages-container');
        
        // Remove existing typing indicator if any
        this.hideTypingIndicator();
        
        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="typing-dots">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        
        messagesContainer.appendChild(typingIndicator);
        this.scrollToBottom();
    },
    
    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    },
    
    updateChatPreview(chatId, message) {
        // Update chat preview in our chats array
        const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
        
        if (chatIndex !== -1) {
            this.chats[chatIndex].lastMessage = message;
            
            // If this is the first message, update the title if it's still the default
            if (this.chats[chatIndex].title === 'New Conversation') {
                // Generate a title from the message (first 30 chars)
                const newTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;
                this.chats[chatIndex].title = newTitle;
                
                // Update chat title in UI
                document.getElementById('chat-title').textContent = newTitle;
                
                // Save the new title in DB
                this.saveTitle(newTitle);
            }
            
            // Move this chat to the top of the list
            const chat = this.chats.splice(chatIndex, 1)[0];
            this.chats.unshift(chat);
            
            // Re-render chat list
            this.renderChatList();
        }
    },
    
    async updateChatTitle(e) {
        const titleInput = document.getElementById('chat-title-input');
        const newTitle = titleInput.value.trim();
        
        if (!newTitle || !this.currentChatId) {
            return;
        }
        
        try {
            UI.closeModal('edit-title-modal');
            UI.showLoading();
            
            await this.saveTitle(newTitle);
            
            // Update UI
            document.getElementById('chat-title').textContent = newTitle;
            
            // Clear input
            titleInput.value = '';
            
            UI.showNotification('Chat title updated', 'success');
        } catch (error) {
            console.error('Failed to update chat title:', error);
            UI.showNotification('Failed to update chat title', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    async saveTitle(title) {
        if (!Auth.currentUser || !this.currentChatId) return;
        
        // Update title in API
        await API.updateChatTitle(this.currentChatId, Auth.currentUser.username, title);
        
        // Update title in our chats array
        const chatIndex = this.chats.findIndex(chat => chat.id === this.currentChatId);
        if (chatIndex !== -1) {
            this.chats[chatIndex].title = title;
            
            // Re-render chat list
            this.renderChatList();
        }
    }
};