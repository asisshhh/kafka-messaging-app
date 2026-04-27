const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { Kafka } = require('kafkajs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Kafka Configuration
const kafka = new Kafka({
  clientId: 'messaging-app',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'messaging-group' });

// In-memory storage
const messages = [];
const connectedClients = new Set();

// Kafka Setup
const initializeKafka = async () => {
  try {
    // Connect Producer
    await producer.connect();
    console.log('✓ Producer connected');

    // Connect Consumer
    await consumer.connect();
    console.log('✓ Consumer connected');

    // Ensure topic exists by subscribing
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: false });
    console.log('✓ Subscribed to test-topic');

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ partition, message }) => {
        try {
          const messageData = {
            id: Date.now(),
            content: message.value.toString(),
            sender: message.headers?.sender?.toString() || 'Anonymous',
            timestamp: new Date().toISOString(),
            partition,
            offset: message.offset.toString(),
          };

          messages.push(messageData);
          console.log('📨 Message consumed:', messageData.content);

          // Broadcast to all WebSocket clients
          broadcastToClients(messageData);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });

    console.log('✓ Consumer started listening for messages');
  } catch (error) {
    console.error('❌ Error initializing Kafka:', error);
    // Retry after 5 seconds
    setTimeout(initializeKafka, 5000);
  }
};

// Helper function to broadcast to WebSocket clients
const broadcastToClients = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'new-message',
        data,
      }));
    }
  });
};

// REST API: Send Message
app.post('/api/send', async (req, res) => {
  try {
    const { content, sender = 'Anonymous' } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    await producer.send({
      topic: 'test-topic',
      messages: [
        {
          value: content.trim(),
          headers: {
            sender: sender.substring(0, 50), // Limit sender name
          },
        },
      ],
    });

    res.json({
      success: true,
      message: 'Message sent to Kafka',
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// REST API: Get All Messages
app.get('/api/messages', (req, res) => {
  try {
    res.json({
      count: messages.length,
      messages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// REST API: Clear Messages
app.post('/api/clear', (req, res) => {
  try {
    const clearedCount = messages.length;
    messages.length = 0;

    // Notify clients
    broadcastToClients({ type: 'messages-cleared', count: clearedCount });

    res.json({
      success: true,
      message: `Cleared ${clearedCount} messages`,
    });
  } catch (error) {
    console.error('Error clearing messages:', error);
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

// REST API: Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    messageCount: messages.length,
    connectedClients: connectedClients.size,
  });
});

// WebSocket Handling
wss.on('connection', (ws) => {
  const clientId = Date.now();
  connectedClients.add(clientId);
  console.log(`🔗 WebSocket client connected (Total: ${connectedClients.size})`);

  // Send current messages to new client
  ws.send(JSON.stringify({
    type: 'initial-messages',
    data: messages,
  }));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);
      console.log('WebSocket message received:', parsed);
      // You can add additional WebSocket message handling here
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    connectedClients.delete(clientId);
    console.log(`❌ WebSocket client disconnected (Total: ${connectedClients.size})`);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Health check endpoint for liveness
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Kafka Messaging App</title></head>
      <body style="font-family: Arial; margin: 20px;">
        <h1>✓ Server is running!</h1>
        <p><a href="/index.html">Go to Messaging App</a></p>
        <p>API: <a href="/api/health">/api/health</a></p>
      </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await producer.disconnect();
    await consumer.disconnect();
    server.close(() => {
      console.log('✓ Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start Server
const PORT = process.env.PORT || 3000;

(async () => {
  await initializeKafka();

  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 WebSocket enabled on ws://localhost:${PORT}`);
    console.log('\n--- API Endpoints ---');
    console.log('POST   /api/send      - Send a message');
    console.log('GET    /api/messages  - Get all messages');
    console.log('POST   /api/clear     - Clear all messages');
    console.log('GET    /api/health    - Health check');
    console.log('WebSocket at ws://localhost:' + PORT);
  });
})().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
