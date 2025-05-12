/**
 * Server Configuration
 * Centralized configuration for the Solace Message Sender server
 * 
 * This file provides default configuration values that can be overridden
 * by environment variables. It follows the pattern of having sensible defaults
 * with the ability to customize for different environments.
 * 
 * @module config
 */

// Server configuration
const serverConfig = {
  // Server port (can be overridden with PORT env var)
  port: process.env.PORT || 5050,
  
  // Client origin for CORS (can be overridden with CLIENT_ORIGIN env var)
  // In production, this should be set to the actual client origin
  // In development, it defaults to the Vite dev server URL
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  
  // CORS configuration
  cors: {
    // HTTP methods allowed for CORS
    methods: ['GET', 'POST', 'OPTIONS'],
    
    // Headers allowed for CORS
    allowedHeaders: ['Content-Type', 'Authorization'],
    
    // Whether to allow credentials (cookies, authorization headers)
    credentials: true
  },
  
  // Node environment (development, production, test)
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Solace configuration defaults
// These are used as fallbacks when client doesn't provide values
// and for documentation purposes
const solaceDefaults = {
  // Log level for Solace client
  logLevel: 'INFO', // Options: DEBUG, INFO, WARN, ERROR, FATAL
  
  // Solace client profile version
  profileVersion: 'version10',
  
  // Default delivery mode
  deliveryMode: 'DIRECT', // Options: DIRECT, PERSISTENT
  
  // Default message property for user ID
  userIdProperty: 'JMSXUserID',
  
  // Default destination type (true for queue, false for topic)
  isQueue: true
};

export default {
  server: serverConfig,
  solace: solaceDefaults
};