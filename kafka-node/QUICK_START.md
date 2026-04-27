# ⚡ Quick Start Guide

Get the Kafka Messaging Application running in 5 minutes!

## 🚀 Prerequisites Check

Before starting, make sure you have:

- ✅ **Node.js 14+** - [Download here](https://nodejs.org/)
- ✅ **Docker & Docker Compose** - [Download here](https://www.docker.com/products/docker-desktop)
- ✅ **Git** (optional) - [Download here](https://git-scm.com/)

**Verify Installation:**
```bash
node --version      # Should show v14.x or higher
docker --version    # Should show Docker version
npm --version       # Should show npm version
```

---

## 📋 Step-by-Step Setup

### Step 1: Start Kafka with Docker (2 minutes)

Open a terminal/PowerShell and run:

```bash
# Navigate to the docker directory
cd c:\Users\nayak\Documents\docker

# Start Kafka and Zookeeper containers
docker-compose up -d
```

**Verify containers started:**
```bash
docker ps
```

You should see `zookeeper`, `kafka`, and `kafka-ui` containers running.

**Access Kafka UI (optional):**
- Open: http://localhost:8080
- Monitor topics, brokers, and consumer groups

---

### Step 2: Install Dependencies (2 minutes)

```bash
# Navigate to the application folder
cd kafka-node

# Install npm packages
npm install
```

This installs Express, KafkaJS, WebSocket library, and other dependencies.

---

### Step 3: Start the Server (1 minute)

```bash
# Start the Node.js server
npm start
```

**Expected output:**
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

---

## 💻 Open the Application

### In Your Browser

1. Open: **http://localhost:3000**
2. You should see the messaging UI with purple header
3. Type your name (optional)
4. Enter a message
5. Click "Send Message"
6. See your message appear in the list! ✓

### Multiple Browser Tabs (Real-time Demo)

1. Open **Tab 1**: http://localhost:3000
2. Open **Tab 2**: http://localhost:3000
3. Send a message in **Tab 1**
4. Watch it appear instantly in **Tab 2** ✓

---

## 🧪 Testing the API

### Option A: Using cURL (Command Line)

**Send a message:**
```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello Kafka!","sender":"Alice"}'
```

**Get all messages:**
```bash
curl http://localhost:3000/api/messages
```

**Check health:**
```bash
curl http://localhost:3000/api/health
```

### Option B: Using the Test Script

**Windows:**
```bash
test-api.bat
```

**Mac/Linux:**
```bash
bash test-api.sh
```

### Option C: Using Postman

Import the following requests:

**POST /api/send**
```
URL: http://localhost:3000/api/send
Method: POST
Body (JSON):
{
  "content": "Hello from Postman",
  "sender": "TestUser"
}
```

**GET /api/messages**
```
URL: http://localhost:3000/api/messages
Method: GET
```

---

## 📊 File Structure

```
kafka-node/
├── server.js              ← Main server file
├── public/
│   └── index.html         ← Frontend UI (open in browser)
├── producer.js            ← Standalone producer example
├── consumer.js            ← Standalone consumer example
├── package.json           ← Dependencies
├── config.js              ← Configuration file
├── README.md              ← Full documentation
└── QUICK_START.md         ← This file
```

---

## 🎮 Features to Try

### 1. Send Messages
- Enter your name
- Type a message
- Click "Send Message"
- Message appears in real-time! ✓

### 2. Real-Time Sync
- Open in 2 browser tabs
- Send message in Tab 1
- Watch it appear in Tab 2 instantly ✓

### 3. Message History
- Click "Clear All" to reset
- Server stores all messages in memory
- View with GET /api/messages ✓

### 4. Status Monitoring
- See "Server: Online" indicator
- See "WebSocket: Connected" indicator
- See message count update in real-time ✓

---

## 🔧 Useful Commands

### Server Management
```bash
# Start server (production mode)
npm start

# Start server with auto-reload (development)
npm run dev

# Run standalone producer
node producer.js

# Run standalone consumer
node consumer.js
```

### Docker Management
```bash
# View Docker logs
docker-compose logs -f kafka

# Stop all containers
docker-compose down

# Remove all data (fresh start)
docker-compose down -v

# Restart containers
docker-compose restart
```

### Port Information
```
3000  - Node.js/Express server
9092  - Kafka broker
2181  - Zookeeper
8080  - Kafka UI
```

---

## ⚠️ Troubleshooting

### ❌ "Cannot connect to localhost:9092"
```bash
# Check if Docker containers are running
docker ps

# If not, start them
docker-compose up -d

# View logs
docker-compose logs kafka
```

### ❌ "Port 3000 already in use"
```bash
# Option 1: Use a different port
PORT=3001 npm start

# Option 2: Kill process using port 3000
# Windows: netstat -ano | findstr :3000
# Then: taskkill /PID <PID> /F
```

### ❌ "npm install fails"
```bash
# Clear cache and reinstall
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

### ❌ "WebSocket connection failed"
- Ensure server is running
- Check browser console (F12) for errors
- Refresh the page
- Try a different browser

---

## 📚 Next Steps

### Learn More
1. Open [README.md](README.md) for full documentation
2. Check [API Documentation](#) for endpoint details
3. Review [server.js](server.js) to understand the code
4. Study the [frontend code](public/index.html) to learn WebSockets

### Customize
1. Change the port: Edit `server.js` or use `PORT=3001 npm start`
2. Change topic name: Update `KAFKA_TOPIC` in [config.js](config.js)
3. Add authentication: Modify `server.js` to add auth middleware
4. Style the UI: Edit `public/index.html` CSS section

### Deploy
1. Push to GitHub/GitLab
2. Deploy to AWS/Heroku/DigitalOcean
3. Set up environment variables
4. Configure Kafka for production

---

## ✅ Verification Checklist

- [ ] Docker containers running: `docker ps`
- [ ] npm install completed: `npm install`
- [ ] Server started: `npm start`
- [ ] Browser loads: http://localhost:3000
- [ ] Send button works
- [ ] Messages display in real-time
- [ ] Status shows "Online" and "Connected"
- [ ] API test works: curl http://localhost:3000/api/health

---

## 🎓 Learning Outcomes

After completing this quick start, you'll understand:

- ✅ How Apache Kafka works
- ✅ Producer-consumer patterns
- ✅ Node.js/Express server development
- ✅ WebSocket real-time communication
- ✅ REST API design
- ✅ Docker containerization
- ✅ Full-stack application architecture

---

## 💡 Pro Tips

1. **Save your name**: The app remembers your name in localStorage
2. **Real-time updates**: Messages appear instantly via WebSockets
3. **Check status**: Look for green indicators showing connection status
4. **Monitor Kafka**: Visit http://localhost:8080 to see Kafka UI
5. **View logs**: Check terminal output to see server logs

---

## 🆘 Need Help?

### Check These Resources
1. [Full README.md](README.md) - Complete documentation
2. [Kafka Documentation](https://kafka.apache.org/documentation/)
3. [KafkaJS Guide](https://kafka.js.org/)
4. [Node.js Documentation](https://nodejs.org/docs/)
5. [Express.js Guide](https://expressjs.com/)

### Common Issues
- See "Troubleshooting" section above
- Check terminal logs for error messages
- Open browser console (F12) for JavaScript errors
- Verify all ports are available

---

## 🎉 You're Ready!

Everything is set up. Start sending messages! 

**Open now:** http://localhost:3000

Happy coding! ❤️

---

**Made with ❤️ for learning and development**
