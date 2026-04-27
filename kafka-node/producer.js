/**
 * Standalone Kafka Producer Example
 * Sends test messages to Kafka topic
 * 
 * Usage: node producer.js
 */

const { Kafka } = require('kafkajs');

// Kafka Configuration
const kafka = new Kafka({
  clientId: 'producer-app',
  brokers: ['localhost:9092'],
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
  ssl: false,
});

const producer = kafka.producer({
  idempotent: true,
  maxInFlightRequests: 5,
  compression: 1, // GZIP compression
});

const run = async () => {
  try {
    console.log('🔄 Connecting producer...');
    await producer.connect();
    console.log('✓ Producer connected');

    // Send sample messages
    const messages = [
      { 
        value: 'Hello from Node.js Producer!',
        headers: { 'sender': 'ProducerApp', 'timestamp': Date.now().toString() }
      },
      { 
        value: 'This is message number 2',
        headers: { 'sender': 'ProducerApp', 'timestamp': Date.now().toString() }
      },
      { 
        value: 'Testing Kafka with KafkaJS',
        headers: { 'sender': 'ProducerApp', 'timestamp': Date.now().toString() }
      },
    ];

    console.log('\n📤 Sending messages to test-topic...');
    
    for (let i = 0; i < messages.length; i++) {
      const result = await producer.send({
        topic: 'test-topic',
        messages: [messages[i]],
        timeout: 30000,
        compression: 1,
      });

      console.log(`✓ Message ${i + 1} sent:`, messages[i].value);
      console.log(`  Partition: ${result[0].partition}, Offset: ${result[0].offset}`);
    }

    console.log('\n✓ All messages sent successfully');
    console.log('💡 Tip: Run consumer.js in another terminal to see these messages\n');

    await producer.disconnect();
    console.log('✓ Producer disconnected');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down...');
  await producer.disconnect();
  process.exit(0);
});

run().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});