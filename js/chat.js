class ChatInterface {
    constructor() {
        this.messageContainer = document.getElementById('message-container');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        
        this.setupEventListeners();
        this.adjustTextareaHeight();
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.messageInput.addEventListener('input', () => this.adjustTextareaHeight());
    }

    adjustTextareaHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = (this.messageInput.scrollHeight) + 'px';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message to UI
        this.addMessageToUI(message, true);
        this.messageInput.value = '';
        this.adjustTextareaHeight();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get the current URL path
            const currentPath = window.location.pathname;
            // Remove the html file name to get the base path
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            // Construct the API URL
            const apiUrl = basePath + 'api/simple_chat.php';

            console.log('Sending request to:', apiUrl); // Debug log

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }

            const data = await response.json();
            console.log('Response data:', data); // Debug log

            // Remove typing indicator
            this.hideTypingIndicator();

            if (data.error) {
                console.error('API Error:', data.error); // Debug log
                this.addMessageToUI('Sorry, an error occurred: ' + data.error, false);
                return;
            }

            // Add AI response to UI
            this.addMessageToUI(data.response, false);

        } catch (error) {
            console.error('Error:', error); // Debug log
            this.hideTypingIndicator();
            this.addMessageToUI('Sorry, an error occurred. Please try again. Error: ' + error.message, false);
        }
    }

    addMessageToUI(message, isUser) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user' : 'ai'}`;
        
        // Format message content
        let formattedMessage = this.formatMessage(message);
        
        messageElement.innerHTML = `
            <div class="message-content">
                ${formattedMessage}
            </div>
        `;

        this.messageContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    formatMessage(message) {
        // Convert URLs to clickable links
        message = message.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Convert line breaks to <br>
        return message.replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai typing-indicator';
        typingIndicator.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.messageContainer.appendChild(typingIndicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = this.messageContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
}

// Initialize chat interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chat = new ChatInterface();
    chat.addMessageToUI("Hello! I'm NalediAI, your mental health support assistant. I'm here to listen and help you navigate your thoughts and feelings. How are you feeling today?", false);
});
