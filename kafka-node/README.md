# 🚀 Real-Time Kafka Messaging Application

A modern, full-stack real-time messaging application built with **Node.js**, **Express**, **Apache Kafka**, and **WebSockets**. Perfect for learning Kafka, real-time systems, and as a portfolio/MCA project.

## 📋 Features

### ✨ Core Features
- **Real-time Messaging** using Apache Kafka
- **WebSocket Support** for instant message delivery
- **REST APIs** for HTTP-based communication
- **In-Memory Message Storage** for quick access
- **User Names** with messages
- **Timestamps** on all messages
- **CORS Enabled** for cross-origin requests
- **Graceful Shutdown** for clean server termination

### 🎨 Frontend Features
- **Modern, Responsive UI** with Tailwind-inspired design
- **Real-time Message Display** via WebSockets
- **Send Message Interface** with validation
- **Message History** view
- **Server & WebSocket Status** indicators
- **Loading States** and error handling
- **Dark Mode Ready** design
- **Mobile-Friendly** layout

### 🔧 Technical Highlights
- **Async/Await** error handling
- **Producer-Consumer Pattern** for Kafka
- **WebSocket Broadcasting** to multiple clients
- **Health Check Endpoint** for monitoring
- **Comprehensive Logging**
- **Environment Variables** support
- **Graceful Error Handling**

## 📁 Project Structure

```
kafka-node/
├── server.js              # Main Express + Kafka server
├── package.json           # Dependencies
├── docker-compose.yml     # Kafka + Zookeeper setup
├── public/
│   └── index.html         # Frontend UI
├── producer.js            # Standalone producer (example)
├── consumer.js            # Standalone consumer (example)
└── README.md              # This file
```

## 🛠️ Prerequisites

- **Node.js** 14+ (Download from [nodejs.org](https://nodejs.org))
- **Docker** and **Docker Compose** (Download from [docker.com](https://www.docker.com))
- **npm** (comes with Node.js)

## ⚙️ Installation & Setup

### Step 1: Start Kafka with Docker

```bash
cd c:\Users\nayak\Documents\docker
docker-compose up -d
```

This starts:
- **Zookeeper** on port 2181
- **Kafka Broker** on port 9092
- **Kafka UI** on port 8080 (for monitoring)

Verify containers are running:
```bash
docker ps
```

You should see `zookeeper`, `kafka`, and `kafka-ui` containers.

### Step 2: Install Dependencies

```bash
cd kafka-node
npm install
```

This installs:
- `express` - Web framework
- `cors` - Cross-origin support
- `kafkajs` - Kafka client
- `ws` - WebSocket library
- `dotenv` - Environment variables
- `nodemon` - Development auto-reload

### Step 3: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Expected output:
```
✓ Producer connected
✓ Consumer connected
✓ Subscribed to test-topic
✓ Consumer started listening for messages

🚀 Server running on http://localhost:3000
📊 WebSocket enabled on ws://localhost:3000

--- API Endpoints ---
POST   /api/send      - Send a message
GET    /api/messages  - Get all messages
POST   /api/clear     - Clear all messages
GET    /api/health    - Health check
```

### Step 4: Open the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the messaging UI with a purple gradient header.

## 🎯 API Documentation

### 1. Send a Message
**POST** `/api/send`

**Request Body:**
```json
{
  "content": "Hello, Kafka!",
  "sender": "John"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent to Kafka",
  "sentAt": "2024-01-15T10:30:45.123Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello from Kafka!","sender":"Alice"}'
```

### 2. Get All Messages
**GET** `/api/messages`

**Response:**
```json
{
  "count": 3,
  "messages": [
    {
      "id": 1705315845123,
      "content": "Hello, Kafka!",
      "sender": "John",
      "timestamp": "2024-01-15T10:30:45.123Z",
      "partition": 0,
      "offset": "0"
    }
  ],
  "timestamp": "2024-01-15T10:35:12.456Z"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/messages
```

### 3. Clear All Messages
**POST** `/api/clear`

**Response:**
```json
{
  "success": true,
  "message": "Cleared 5 messages"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/clear
```

### 4. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:35:12.456Z",
  "messageCount": 3,
  "connectedClients": 2
}
```

## 📡 WebSocket Usage

The application automatically connects via WebSocket when you load the frontend. Here's what happens:

1. **Connection**: Browser connects to `ws://localhost:3000`
2. **Initial Messages**: Server sends all existing messages
3. **New Messages**: Any new message is broadcast to all connected clients
4. **Auto-Reconnect**: Client reconnects if connection drops

**Example (JavaScript):**
```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => console.log('Connected');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

ws.onerror = (error) => console.error('Error:', error);
```

## 🎓 Usage Examples

### Example 1: Send Multiple Messages
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Send messages
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"content":"Message 1","sender":"Alice"}'

curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"content":"Message 2","sender":"Bob"}'

# Terminal 3: Get all messages
curl http://localhost:3000/api/messages
```

### Example 2: Use Multiple Clients
1. Open `http://localhost:3000` in Browser 1
2. Open `http://localhost:3000` in Browser 2
3. Send a message in Browser 1
4. Message appears in real-time in Browser 2 ✓

### Example 3: Standalone Producer (optional)
```bash
node producer.js
```

### Example 4: Standalone Consumer (optional)
```bash
node consumer.js
```

## 🐳 Docker Commands Reference

```bash
# Start Kafka and Zookeeper
docker-compose up -d

# View logs
docker-compose logs -f kafka

# Stop services
docker-compose down

# Remove volumes (fresh start)
docker-compose down -v

# View Kafka UI
# Open: http://localhost:8080

# Check container status
docker ps
```

## 📊 Monitoring

### Kafka UI
Access the Kafka monitoring dashboard:
```
http://localhost:8080
```

Features:
- View topics and partitions
- Monitor consumer groups
- Check broker status

### Server Health
```bash
curl http://localhost:3000/api/health
```

## 🚀 Production Considerations

For deploying to production:

1. **Environment Variables**
   ```bash
   # Create .env file
   PORT=3000
   KAFKA_BROKERS=kafka-broker.example.com:9092
   NODE_ENV=production
   ```

2. **Kafka Configuration**
   - Use multiple brokers for high availability
   - Enable authentication and encryption
   - Configure proper replication factor

3. **Performance**
   - Use Redis for message caching instead of memory
   - Implement message persistence to database
   - Add horizontal scaling with load balancer

4. **Security**
   - Add authentication to APIs
   - Implement rate limiting
   - Use HTTPS/WSS
   - Add input validation

5. **Monitoring**
   - Set up centralized logging
   - Add application metrics (Prometheus)
   - Set up alerting

## 🐛 Troubleshooting

### Issue: "Cannot connect to localhost:9092"
**Solution:**
```bash
# Verify Docker containers are running
docker ps

# If not, start them
docker-compose up -d

# Check Kafka logs
docker-compose logs kafka
```

### Issue: "WebSocket connection failed"
**Solution:**
- Ensure server is running: `npm start`
- Check browser console for errors
- Try refreshing the page
- Clear browser cache

### Issue: "npm install fails"
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -r node_modules

# Reinstall
npm install
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Change port in server.js or use environment variable
PORT=3001 npm start

# Or kill the process using port 3000
# Windows: netstat -ano | findstr :3000
# Then: taskkill /PID <PID> /F
```

## 📝 Code Structure

### server.js Highlights

```javascript
// Kafka Setup
const kafka = new Kafka({
  clientId: 'messaging-app',
  brokers: ['localhost:9092'],
});

// Express APIs
app.post('/api/send', async (req, res) => { /* ... */ });
app.get('/api/messages', (req, res) => { /* ... */ });

// WebSocket Broadcasting
wss.on('connection', (ws) => { /* ... */ });
```

### frontend (index.html) Highlights

```javascript
// WebSocket Connection
const ws = new WebSocket(`ws://${window.location.host}`);

// Send Message
async function handleSendMessage(e) {
  const response = await fetch(`${API_BASE}/api/send`, {
    method: 'POST',
    body: JSON.stringify({ content, sender }),
  });
}

// Real-time Updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  renderMessages();
};
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, mobile
- **Real-time Updates**: Messages appear instantly
- **Status Indicators**: See server and WebSocket status
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during operations
- **Local Storage**: Remembers user name

## 📚 Learning Resources

- **Kafka Basics**: [Kafka Documentation](https://kafka.apache.org/documentation/)
- **KafkaJS**: [KafkaJS Guide](https://kafka.js.org/)
- **Express.js**: [Express Documentation](https://expressjs.com/)
- **WebSockets**: [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- **Node.js**: [Node.js Documentation](https://nodejs.org/docs/)

## 🎓 Use Cases

### Perfect For:
- ✅ Learning Kafka and real-time systems
- ✅ Portfolio projects
- ✅ MCA final year projects
- ✅ Teaching event-driven architecture
- ✅ Rapid prototyping
- ✅ IoT message systems
- ✅ Chat applications
- ✅ Live notifications

## 📈 Future Enhancements

- [ ] Message persistence (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Message search and filtering
- [ ] Message reactions/emoji support
- [ ] File attachment support
- [ ] Direct messaging between users
- [ ] Message encryption
- [ ] Admin dashboard
- [ ] Rate limiting and throttling
- [ ] Docker image and Kubernetes deployment

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📧 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Docker and Kafka logs
3. Check the browser console for errors
4. Verify all services are running

---

**Happy Coding! 🎉**

Made with ❤️ for learning and development.
