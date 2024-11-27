const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const cors = require('cors');

const allowedOrigins = [
  'https://chat-application-85mb0re1y-mayank-pawars-projects.vercel.app',
  'http://localhost:3000'  // Keep this for local development
];

// Create HTTP server
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '../public', req.url === '/' ? 'index.html' : req.url);
    let contentType = getContentType(filePath);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Error loading ' + filePath);
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
    // Verify origin
    const origin = req.headers.origin;
    if (!allowedOrigins.includes(origin)) {
        ws.close();
        return;
    }

    let username = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'login':
                if (isUsernameValid(data.username)) {
                    username = data.username;
                    clients.set(ws, username);
                    broadcastMessage({
                        type: 'system',
                        message: `${username} joined the chat`
                    });
                    ws.send(JSON.stringify({
                        type: 'login',
                        success: true
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: 'login',
                        success: false,
                        message: 'Username is taken or invalid'
                    }));
                }
                break;

            case 'message':
                if (username) {
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
            broadcastMessage({
                type: 'system',
                message: `${username} left the chat`
            });
            clients.delete(ws);
        }
    });
});

function broadcastMessage(message) {
    const messageStr = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

function isUsernameValid(username) {
    return username &&
           username.length >= 3 &&
           username.length <= 15 &&
           !Array.from(clients.values()).includes(username);
}

function getContentType(filePath) {
    const ext = path.extname(filePath);
    switch (ext) {
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.js': return 'text/javascript';
        default: return 'text/plain';
    }
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// If you're using Express, add CORS headers
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
}));