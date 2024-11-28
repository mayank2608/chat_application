# Real-Time Chat Application

A real-time chat application built with WebSocket technology, allowing multiple users to communicate simultaneously in a shared chat room.

## Features

- Real-time messaging
- Username-based authentication
- Automatic reconnection on connection loss
- System notifications for user join/leave events
- Responsive design for both desktop and mobile devices

## Architecture

### Server
- Built with Node.js and WebSocket (ws) library
- Handles concurrent connections using WebSocket's event-driven architecture
- Maintains a collection of active connections for broadcasting messages
- Implements basic username validation and message broadcasting

### Client
- Pure JavaScript implementation using native WebSocket API
- Implements automatic reconnection with exponential backoff
- Handles various WebSocket states (connecting, open, closing, closed)
- Separates UI concerns from WebSocket communication logic


## Technologies Used

### Backend
- Node.js - Runtime environment
- Express.js - Web application framework
- ws (WebSocket) - WebSocket server implementation
- dotenv - Environment variable management

### Frontend
- HTML5 - Structure and WebSocket API
- CSS3 - Styling and responsive design
- Vanilla JavaScript - Client-side logic
- WebSocket API - Real-time communication


## Running Locally

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Server Setup
1. Clone the repository
```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
npm start
```
The server will start on port 3000 by default.

### Client Setup
1. Open `public/index.html` in a web browser
   - If running locally, use: `http://localhost:3000`

## Accessing the Deployed Application

The application is deployed and accessible at:
- Frontend: https://chat-application-one-xi.vercel.app
- Backend: https://chat-application-7gum.onrender.com
- WebSocket: wss://chat-application-7gum.onrender.com

## Design Choices & Assumptions

### Concurrency Handling
- The server maintains a Set of active connections for efficient broadcasting
- Each message is broadcast to all connected clients except the sender
- Connection management is handled asynchronously to prevent blocking

### Reconnection Strategy
- Implements automatic reconnection with up to 5 attempts
- 3-second delay between reconnection attempts
- Manual refresh required after max attempts reached

### Security Considerations
- Basic username validation to prevent duplicates
- Messages are sanitized to prevent XSS attacks
- WebSocket connection is secured using WSS protocol

### State Management
- Client maintains minimal state (username and connection status)
- Server is stateless except for active connections tracking
- Connection state is handled through WebSocket lifecycle events

## Error Handling
- Automatic reconnection on connection loss
- User-friendly error messages
- Graceful degradation when WebSocket connection fails

## Future Improvements
- Add user authentication
- Implement private messaging
- Add support for different chat rooms
- Message persistence
- User typing indicators
- Read receipts

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.