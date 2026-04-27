/**
 * Standalone Kafka Consumer Example
 * Listens for messages on Kafka topic
 * 
 * Usage: node consumer.js
 */

const { Kafka, logLevel } = require('kafkajs');

// Kafka Configuration
const kafka = new Kafka({
  clientId: 'consumer-app',
  brokers: ['localhost:9092'],
  logLevel: logLevel.INFO,
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
  ssl: false,
});

const consumer = kafka.consumer({
  groupId: 'test-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

const run = async () => {
  try {
    console.log('🔄 Connecting consumer...');
    await consumer.connect();
    console.log('✓ Consumer connected');

    // Subscribe to topic
    console.log('🔄 Subscribing to test-topic...');
    await consumer.subscribe({
      topic: 'test-topic',
      fromBeginning: true, // Read from the beginning
    });
    console.log('✓ Subscribed to test-topic');

    // Start consuming
    console.log('\n⏳ Listening for messages (Press Ctrl+C to exit)...\n');
    
    let messageCount = 0;

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        messageCount++;
        
        const timestamp = new Date(parseInt(message.timestamp || Date.now())).toISOString();
        const sender = message.headers?.sender?.toString() || 'Unknown';
        
        console.log(`\n📨 Message #${messageCount}`);
        console.log(`   Topic: ${topic}`);
        console.log(`   Partition: ${partition}`);
        console.log(`   Offset: ${message.offset}`);
        console.log(`   Sender: ${sender}`);
        console.log(`   Timestamp: ${timestamp}`);
        console.log(`   Content: ${message.value.toString()}`);
        console.log('   ' + '─'.repeat(50));
      },
      eachPartition: async (topicPartition) => {
        console.log(`\n👀 Started consuming partition ${topicPartition.partition}`);
      },
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⏹️  Shutting down gracefully...');
  try {
    await consumer.disconnect();
    console.log('✓ Consumer disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n\n⏹️  Received SIGTERM, shutting down...');
  try {
    await consumer.disconnect();
    console.log('✓ Consumer disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start consumer
console.log('🚀 Starting Kafka Consumer\n');
run().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});