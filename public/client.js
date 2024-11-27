class ChatClient {
    constructor() {
        this.ws = null;
        this.username = null;
        this.setupDOMElements();
        this.attachEventListeners();
    }

    setupDOMElements() {
        this.loginScreen = document.getElementById('login-screen');
        this.chatScreen = document.getElementById('chat-screen');
        this.usernameInput = document.getElementById('username-input');
        this.joinBtn = document.getElementById('join-btn');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.messagesContainer = document.getElementById('messages');
        this.usernameDisplay = document.getElementById('username-display');
    }

    attachEventListeners() {
        this.joinBtn.onclick = () => this.handleLogin();
        this.sendBtn.onclick = () => this.sendMessage();
        this.messageInput.onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
        this.usernameInput.onkeypress = (e) => {
            if (e.key === 'Enter') this.handleLogin();
        };
    }

    connect() {
        this.ws = new WebSocket('https://chat-application-7gum.onrender.com');
        this.ws.onmessage = (event) => this.handleMessage(event);
        this.ws.onclose = () => this.handleDisconnect();
    }

    handleLogin() {
        const username = this.usernameInput.value.trim();
        if (username) {
            this.connect();
            this.ws.onopen = () => {
                this.ws.send(JSON.stringify({
                    type: 'login',
                    username: username
                }));
            };
        }
    }

    handleMessage(event) {
        const data = JSON.parse(event.data);

        switch (data.type) {
            case 'login':
                if (data.success) {
                    this.username = this.usernameInput.value.trim();
                    this.loginScreen.classList.add('hidden');
                    this.chatScreen.classList.remove('hidden');
                    this.usernameDisplay.textContent = `Logged in as: ${this.username}`;
                } else {
                    alert(data.message);
                }
                break;

            case 'message':
                this.addMessage(`${data.username}: ${data.message}`, 'user-message');
                break;

            case 'system':
                this.addMessage(data.message, 'system-message');
                break;
        }
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (message) {
            this.ws.send(JSON.stringify({
                type: 'message',
                message: message
            }));
            this.messageInput.value = '';
        }
    }

    addMessage(message, className) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${className}`;
        messageElement.textContent = message;
        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    handleDisconnect() {
        alert('Disconnected from server. Please refresh the page to reconnect.');
    }
}

// Initialize the chat client
const chat = new ChatClient();
