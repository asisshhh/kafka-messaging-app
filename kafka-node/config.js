/**
 * Configuration file for Kafka Messaging Application
 * Load from environment variables with sensible defaults
 */

require('dotenv').config();

module.exports = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',

  // Kafka
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'messaging-app',
    groupId: process.env.KAFKA_GROUP_ID || 'messaging-group',
    topic: process.env.KAFKA_TOPIC || 'test-topic',
    connectionTimeout: 10000,
    requestTimeout: 30000,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Message Storage
  maxMessages: 1000, // Maximum messages to keep in memory
};
