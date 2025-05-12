/**
 * Express Server for Solace Message Sender Application
 * 
 * This server provides API endpoints for sending messages to Solace message brokers.
 * It handles CORS configuration, request validation, and error handling.
 * 
 * @module server
 * @author Solace-Poke Team
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.js';
import sendMessageRoutes from './routes/sendMessage.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();
// Set server port from environment variables or use default
const PORT = process.env.PORT || 5050;

/**
 * Middleware Configuration
 * Sets up CORS, request parsing, and other middleware for the Express application
 */

/**
 * CORS Configuration
 * Configures Cross-Origin Resource Sharing to allow requests from appropriate origins
 * Different settings are used for development vs. production environments
 */
const corsOptions = {
  // In production, use the CLIENT_ORIGIN env var or default to localhost
  // In development, allow requests from any origin
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_ORIGIN || 'http://localhost:5173'
    : true,
  // Only allow specific HTTP methods
  methods: ['GET', 'POST', 'OPTIONS'],
  // Only allow specific headers
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Allow credentials (cookies, authorization headers) to be sent
  credentials: true
};
app.use(cors(corsOptions));

// Add a specific handler for OPTIONS requests (preflight requests)
// This is important for browsers to check if the actual request is allowed
app.options('*', cors());

// Parse JSON request bodies
app.use(express.json());

/**
 * Register routes
 * Mount the route modules at their respective endpoints
 */
app.use('/health', healthRoutes);
app.use('/send-message', sendMessageRoutes);

/**
 * Server startup logic
 * Only starts the server if not in test mode
 * Includes automatic port selection if the initial port is in use
 */
if (process.env.NODE_ENV !== 'test') {
  /**
   * Attempts to start the server on the specified port
   * If the port is in use, it will try the next port number
   * This allows the server to find an available port automatically
   * 
   * @param {number} port - The port to try starting the server on
   * @returns {http.Server} - The server instance (not used directly)
   */
  const startServer = (port) => {
    const server = app.listen(port)
      .on('listening', () => {
        // Server started successfully
        console.log(`Server running on port ${port}`);
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          // Port is already in use, try the next port
          console.log(`Port ${port} is already in use, trying port ${port + 1}`);
          server.close();
          startServer(port + 1);
        } else {
          // Other server error occurred
          console.error('Server error:', err);
        }
      });
  };

  // Start the server with the initial port
  startServer(PORT);
}

/**
 * Export the Express app for testing
 * This allows tests to import the app without starting the server
 */
export default app;
