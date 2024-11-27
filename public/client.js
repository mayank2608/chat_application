class ChatClient {
    constructor() {
        this.ws = null;
        this.username = null;
        this.retryAttempts = 0; // Track reconnection attempts
        this.maxRetries = 5; // Limit reconnection attempts
        this.retryDelay = 2000; // Delay between reconnection attempts in ms
        this.setupDOMElements();
        this.attachEventListeners();
    }

    connect() {
        // Prevent reconnect attempts if WebSocket is already active or too many retries
        if (
            this.ws &&
            (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) ||
            this.retryAttempts >= this.maxRetries
        ) {
            return;
        }

        this.ws = new WebSocket('wss://chat-application-7gum.onrender.com'); // Correct WebSocket URL

        this.ws.onopen = () => {
            console.log('Connected to server');
            this.retryAttempts = 0; // Reset retries on successful connection
        };

        this.ws.onmessage = (event) => this.handleMessage(event);

        this.ws.onclose = () => {
            console.warn('Disconnected from server. Attempting to reconnect...');
            this.retryReconnect();
        };

        this.ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };
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

    handleLogin() {
        const username = this.usernameInput.value.trim();
        if (username) {
            this.connect();

            const waitForOpenConnection = () => {
                return new Promise((resolve, reject) => {
                    const interval = setInterval(() => {
                        if (this.ws.readyState === WebSocket.OPEN) {
                            clearInterval(interval);
                            resolve();
                        } else if (this.retryAttempts >= this.maxRetries) {
                            clearInterval(interval);
                            reject(new Error('Failed to connect to WebSocket'));
                        }
                    }, 100);
                });
            };

            waitForOpenConnection()
                .then(() => {
                    this.ws.send(JSON.stringify({ type: 'login', username: username }));
                })
                .catch((err) => {
                    console.error(err);
                    alert('Could not connect to server. Please try again.');
                });
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
        if (message && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'message', message: message }));
            this.messageInput.value = '';
        } else {
            alert('Unable to send message. Reconnecting...');
            this.connect();
        }
    }

    addMessage(message, className) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${className}`;
        messageElement.textContent = message;
        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    retryReconnect() {
        if (this.retryAttempts < this.maxRetries) {
            this.retryAttempts++;
            setTimeout(() => this.connect(), this.retryDelay);
        } else {
            console.error('Max reconnection attempts reached. Please refresh the page.');
        }
    }
}

// Initialize the chat client
const chat = new ChatClient();
