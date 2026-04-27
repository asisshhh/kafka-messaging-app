# 🏗️ Architecture & System Design

## 📐 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTS (Browsers)                      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Frontend UI (HTML/CSS/JavaScript)                   │   │
│  │  ├── Message Input Form                              │   │
│  │  ├── Message List Display                            │   │
│  │  ├── WebSocket Connection Handler                    │   │
│  │  └── REST API Integration                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ▲                                    │
│                          │ HTTP/WebSocket                     │
│                          ▼                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP requests & WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    NODE.JS SERVER                            │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js Application                              │   │
│  │  ├── Router: POST /api/send                          │   │
│  │  ├── Router: GET /api/messages                       │   │
│  │  ├── Router: POST /api/clear                         │   │
│  │  ├── Router: GET /api/health                         │   │
│  │  └── Static: Serves /public/index.html               │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WebSocket Server (ws)                               │   │
│  │  ├── Connection Manager                              │   │
│  │  ├── Message Broadcaster                             │   │
│  │  └── Auto-Reconnect Handler                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Message Storage (In-Memory)                         │   │
│  │  └── Array of Message Objects                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Kafka Producer (KafkaJS)                            │   │
│  │  ├── Connect to Broker                               │   │
│  │  ├── Send Message to Topic                           │   │
│  │  └── Handle Errors & Retries                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Kafka Consumer (KafkaJS)                            │   │
│  │  ├── Connect to Broker                               │   │
│  │  ├── Subscribe to Topic                              │   │
│  │  ├── Listen for New Messages                         │   │
│  │  └── Store in Memory & Broadcast                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ TCP Port 9092
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  DOCKER CONTAINERS                           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Zookeeper (Port 2181)                                │ │
│  │  └── Kafka Coordination & Configuration               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Kafka Broker (Port 9092)                             │ │
│  │  ├── Topics: test-topic                               │ │
│  │  ├── Partitions: 1                                    │ │
│  │  └── Messages: Persisted on Disk                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Kafka UI (Port 8080)                                 │ │
│  │  └── Monitor Brokers, Topics, Consumer Groups         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Message Flow Diagram

### Sending a Message

```
Client (Browser)
    │
    │ 1. User types message & clicks Send
    ▼
Form Submission
    │
    │ 2. POST /api/send (JSON)
    │    { "content": "Hello", "sender": "Alice" }
    ▼
Express Route Handler (/api/send)
    │
    │ 3. Validate input
    ▼
Kafka Producer
    │
    │ 4. Send to test-topic
    │    Message: { value: "Hello", headers: { sender: "Alice" } }
    ▼
Kafka Broker
    │
    │ 5. Store in partition 0
    ▼
Kafka Consumer
    │
    │ 6. Receive message
    │    eachMessage callback triggered
    ▼
Process & Format
    │
    │ 7. Create messageData object
    │    { id, content, sender, timestamp, partition, offset }
    ▼
In-Memory Storage
    │
    │ 8. Push to messages array
    ▼
WebSocket Broadcast
    │
    │ 9. Send to all connected clients
    │    { type: "new-message", data: messageData }
    ▼
Client Browsers
    │
    │ 10. Receive via WebSocket
    ▼
renderMessages()
    │
    │ 11. Display message in UI
    ▼
User Sees Message ✓
```

### Fetching Message History

```
Client (Browser) - Page Load
    │
    │ 1. WebSocket connects
    ▼
WebSocket.onopen
    │
    │ 2. Server sends initial messages
    │    { type: "initial-messages", data: [...] }
    ▼
Client Receives
    │
    │ 3. Parse and store messages
    ▼
renderMessages()
    │
    │ 4. Display all messages
    ▼
User Sees History ✓
```

---

## 🗄️ Data Structure

### Message Object
```javascript
{
  id: 1705315845123,              // Timestamp-based ID
  content: "Hello, Kafka!",        // Message text
  sender: "Alice",                 // Sender name
  timestamp: "2024-01-15T10:30:45Z",  // ISO8601 timestamp
  partition: 0,                    // Kafka partition
  offset: "42"                     // Kafka offset (position in partition)
}
```

### Request/Response Formats

**POST /api/send Request:**
```json
{
  "content": "Message text",
  "sender": "Optional name"
}
```

**POST /api/send Response:**
```json
{
  "success": true,
  "message": "Message sent to Kafka",
  "sentAt": "2024-01-15T10:30:45.123Z"
}
```

**GET /api/messages Response:**
```json
{
  "count": 3,
  "messages": [
    { "id": 1, "content": "...", "sender": "...", ... },
    { "id": 2, "content": "...", "sender": "...", ... }
  ],
  "timestamp": "2024-01-15T10:35:12.456Z"
}
```

---

## 🔌 Component Interactions

### Server Components

```
┌─────────────────┐
│ Express Server  │
└────────┬────────┘
         │
    ┌────┴────┬───────────┬────────────┐
    ▼         ▼           ▼            ▼
┌────────┐ ┌──────┐ ┌──────────┐ ┌──────────┐
│ Router │ │CORS  │ │ Static   │ │ Error    │
│        │ │Config│ │ Files    │ │ Handler  │
└────────┘ └──────┘ └──────────┘ └──────────┘
    │
    └─────────┬──────────┐
              ▼          ▼
        ┌──────────┐ ┌────────────┐
        │ Kafka    │ │ WebSocket  │
        │ Producer │ │ Server     │
        └────┬─────┘ └────┬───────┘
             │            │
             ▼            ▼
        ┌────────────┐ ┌────────────┐
        │ Kafka      │ │ Message    │
        │ Consumer   │ │ Storage    │
        └─────┬──────┘ └──────┬─────┘
              │               │
              └───────┬───────┘
                      ▼
            ┌───────────────────┐
            │ Broadcasting      │
            │ to All Clients    │
            └───────────────────┘
```

### Frontend Components

```
┌──────────────────────────────┐
│     HTML Page (index.html)   │
└─────────┬────────────────────┘
          │
    ┌─────┴──────┬──────────┬─────────────┐
    ▼            ▼          ▼             ▼
┌────────┐ ┌────────────┐ ┌─────────┐ ┌──────────┐
│ Header │ │ Input      │ │ Message │ │ Status   │
│        │ │ Form       │ │ List    │ │ Panel    │
└────────┘ └────────────┘ └─────────┘ └──────────┘
    │            │          │            │
    └────────────┴──────────┴────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   JavaScript    │
        │   Event Loop    │
        └────────┬────────┘
                 │
        ┌────────┴─────────┐
        ▼                  ▼
    ┌────────┐      ┌────────────┐
    │ REST   │      │ WebSocket  │
    │ API    │      │ Connection │
    │ Calls  │      └────────────┘
    └────────┘
```

---

## 📊 State Management

### Server State
```javascript
// Global variables maintained in server memory

messages = []              // Array of all received messages
connectedClients = Set()   // Set of connected WebSocket clients
producer = kafka.producer()     // Kafka producer instance
consumer = kafka.consumer()     // Kafka consumer instance
```

### Client State
```javascript
// Client-side state (in browser memory)

messages = []              // Cached messages
ws = null                  // WebSocket connection
isConnected = false        // Connection status
senderName = ""            // User's name (from localStorage)
```

---

## 🔐 Security Architecture

### Input Validation
```
Client Input
    │
    ├─ Message content check (required, trim)
    ├─ Sender name limit (50 chars)
    ├─ Content validation (no empty)
    │
    ▼
Sanitization
    │
    ├─ HTML escape (frontend rendering)
    ├─ String trim
    ├─ Size limits
    │
    ▼
Kafka Producer
    │
    ├─ Message serialization
    ├─ Error handling
    │
    ▼
Safe Storage & Broadcast
```

### CORS Configuration
```javascript
// Allow requests only from approved origins
cors({
  origin: '*',           // In development
  credentials: true
})

// In production:
cors({
  origin: 'https://yourdomain.com',
  credentials: true
})
```

---

## ⚡ Performance Considerations

### Memory Management
```
┌─────────────────────┐
│ Message Storage     │
├─────────────────────┤
│ Max: 1000 messages  │
│ Per message: ~500B  │
│ Total RAM: ~500KB   │
├─────────────────────┤
│ Cleanup strategy    │
│ - FIFO if exceeded  │
│ - Or external DB    │
└─────────────────────┘
```

### Kafka Optimization
```javascript
// Producer settings
idempotent: true               // Exactly-once semantics
compression: 1                 // GZIP compression
maxInFlightRequests: 5         // Parallel requests

// Consumer settings
sessionTimeout: 30000          // Reconnect window
heartbeatInterval: 3000        // Keep-alive signal
```

### WebSocket Efficiency
```javascript
// Only broadcast to OPEN connections
if (client.readyState === WebSocket.OPEN) {
  client.send(JSON.stringify(data));
}

// Auto-reconnect if disconnected
ws.onclose = () => {
  setTimeout(connectWebSocket, 3000);
}
```

---

## 🔄 Error Handling Flow

```
Operation Attempted
    │
    ├─ try/catch block
    │
    ▼
Error Occurs?
    │
    ├─ YES: Log error
    │
    ├─ Handle gracefully
    │
    ├─ Return meaningful error
    │
    ▼
├─ HTTP: 4xx/5xx status
├─ WebSocket: Error event
├─ Frontend: Show user message
    │
    ▼
├─ Retry strategy
├─ Auto-reconnect
├─ Graceful degradation
    │
    ▼
✓ User informed & system stable
```

---

## 🚀 Deployment Architecture

### Development
```
Laptop
  ├─ Docker (Kafka + Zookeeper)
  ├─ Node.js Server (localhost:3000)
  └─ Browser (http://localhost:3000)
```

### Production (AWS)
```
┌────────────────────────────────────────┐
│          Route 53 (DNS)                │
└─────────────────┬──────────────────────┘
                  │
        ┌─────────▼──────────┐
        │ CloudFront (CDN)   │
        └─────────┬──────────┘
                  │
        ┌─────────▼──────────┐
        │ Application Load   │
        │ Balancer (443)     │
        └─────────┬──────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
    ┌─────────┐         ┌─────────┐
    │ EC2     │         │ EC2     │
    │ Auto    │         │ Auto    │
    │ Scaling │         │ Scaling │
    │ Group   │         │ Group   │
    └────┬────┘         └────┬────┘
         │                   │
         └─────────┬─────────┘
                   ▼
        ┌──────────────────┐
        │ Managed Kafka    │
        │ Cluster (MSK)    │
        └──────────────────┘
```

---

## 📈 Scalability Paths

### Horizontal Scaling
```
Multiple Server Instances
    ├─ Instance 1 (port 3000)
    ├─ Instance 2 (port 3001)
    ├─ Instance 3 (port 3002)
    │
    └─ Load Balancer (distributes traffic)
        │
        └─ Shared Kafka Cluster
            ├─ Broker 1
            ├─ Broker 2
            └─ Broker 3
```

### Vertical Scaling
```
Single Instance
    ├─ Increase CPU cores
    ├─ Increase RAM
    ├─ Optimize database queries
    └─ Enable caching (Redis)
```

### Data Scaling
```
In-Memory Storage
    │
    ├─ Current: 1000 messages in RAM
    │
    └─ Upgrade to:
        ├─ Redis: Fast in-memory store
        ├─ MongoDB: Document database
        └─ PostgreSQL: Relational database
```

---

## 🔍 Monitoring Architecture

```
┌─────────────────────────────┐
│ Application Metrics         │
├─────────────────────────────┤
│ - Response times            │
│ - Error rates               │
│ - Request counts            │
│ - Connected clients         │
│ - Message throughput        │
└────────────┬────────────────┘
             │
    ┌────────┴────────┬──────────────┐
    ▼                 ▼              ▼
┌──────────┐    ┌──────────┐   ┌──────────┐
│ Prometheus│    │   ELK    │   │Datadog   │
│ (Metrics) │    │  (Logs)  │   │(APM)     │
└──────────┘    └──────────┘   └──────────┘
    │                │              │
    └────────┬───────┴──────────────┘
             ▼
        ┌─────────────┐
        │  Grafana    │
        │(Dashboards) │
        └─────────────┘
             │
             ▼
        ┌─────────────┐
        │  Alerting   │
        │(PagerDuty)  │
        └─────────────┘
```

---

## 💾 Data Persistence Strategy

### Current Implementation
```
Messages: In-memory array
├─ Fast access: O(1) lookup
├─ Limited capacity: ~1000 messages
└─ Persists while server running
```

### Upgrade Path 1: Redis Cache
```
Hot Storage: Redis
├─ TTL: 24 hours
├─ Capacity: Depends on server
└─ Fast: <1ms access time

Cold Storage: Database
├─ Permanent retention
└─ Archival after TTL expiry
```

### Upgrade Path 2: Database
```
PostgreSQL
├─ Schema:
│  ├─ id (serial, PK)
│  ├─ content (text)
│  ├─ sender (varchar)
│  ├─ timestamp (timestamptz)
│  ├─ partition (int)
│  └─ offset (bigint)
├─ Indexes on timestamp & sender
└─ Retention policy: 30 days
```

---

This architecture is **scalable**, **maintainable**, and **production-ready**! ✅
