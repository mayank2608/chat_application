const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express(); // Define the Express app
const PORT = process.env.PORT || 3000; // Use environment port for deployment or fallback to 3000

// Allowed origins for CORS and WebSocket connections
const allowedOrigins = [
    'https://chat-application-one-xi.vercel.app', // Replace with your Vercel frontend URL
    'http://localhost:3000'                     // Allow local development
];

// Middleware to handle CORS
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Fallback route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients and their usernames
const clients = new Map();

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    // Verify origin for security
    const origin = req.headers.origin;
    if (!allowedOrigins.includes(origin)) {
        ws.close();
        console.error(`Connection from disallowed origin: ${origin}`);
        return;
    }

    console.log('Client connected');
    let username = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'login':
                if (isUsernameValid(data.username)) {
                    username = data.username;
                    clients.set(ws, username);
                    console.log(`${username} logged in`);

                    // Notify all clients that a new user joined
                    broadcastMessage({
                        type: 'system',
                        message: `${username} joined the chat`
                    });

                    // Send success response to the current client
                    ws.send(JSON.stringify({
                        type: 'login',
                        success: true
                    }));
                } else {
                    // Send error response if username is invalid
                    ws.send(JSON.stringify({
                        type: 'login',
                        success: false,
                        message: 'Username is taken or invalid'
                    }));
                }
                break;

            case 'message':
                if (username) {
                    console.log(`Message from ${username}: ${data.message}`);
                    broadcastMessage({
                        type: 'message',
                        username: username,
                        message: data.message
                    });
                }
                break;
        }
    });

    ws.on('close', () => {
        if (username) {
            console.log(`${username} disconnected`);
            broadcastMessage({
                type: 'system',
                message: `${username} left the chat`
            });
            clients.delete(ws);
        }
    });
});

// Helper function to broadcast messages to all connected clients
function broadcastMessage(message) {
    const messageStr = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

// Helper function to validate usernames
function isUsernameValid(username) {
    return username &&
           username.length >= 3 &&
           username.length <= 15 &&
           !Array.from(clients.values()).includes(username);
}

// Start the HTTP server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
