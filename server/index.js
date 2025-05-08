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
import solaceService from './solaceService.js';

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
 * Health check endpoint
 * Returns the server status, port, and current timestamp
 * Used by clients to verify server availability
 * 
 * @route GET /health
 * @returns {Object} 200 - Server status information
 * @returns {string} status - Always "ok" if server is running
 * @returns {number} port - The port the server is running on
 * @returns {string} timestamp - ISO timestamp of the request
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

/**
 * API endpoint to send a message to a Solace broker
 * Accepts connection parameters and message details, then uses solaceService to send the message
 * 
 * @route POST /send-message
 * @param {Object} req.body - The request body containing Solace connection and message parameters
 * @param {string} req.body.brokerUrl - URL of the Solace broker
 * @param {string} req.body.vpnName - VPN name (can also be provided as 'vpn')
 * @param {string} req.body.username - Username for authentication
 * @param {string} req.body.password - Password for authentication
 * @param {string} req.body.destination - Destination name (queue or topic)
 * @param {string|Object} req.body.payload - Message payload (can also be provided as 'message')
 * @param {boolean} [req.body.isQueue=true] - Whether the destination is a queue (true) or topic (false)
 * @returns {Object} 200 - Success response
 * @returns {boolean} success - Whether the operation was successful
 * @returns {string} message - Success message
 * @returns {Object} 500 - Error response
 * @returns {boolean} success - Always false for errors
 * @returns {string} message - Error message
 * @returns {string} error - Detailed error message
 */
app.post('/send-message', async (req, res) => {
  try {
    // Normalize the request body to handle different field name formats
    // This allows for flexibility in how clients can format their requests
    const normalizedBody = {
      brokerUrl: req.body.brokerUrl,
      vpnName: req.body.vpnName || req.body.vpn,  // Support both vpnName and vpn fields
      username: req.body.username,
      password: req.body.password,
      destination: req.body.destination,
      payload: req.body.payload || req.body.message,  // Support both payload and message fields
      isQueue: req.body.isQueue !== undefined ? req.body.isQueue : true // Default to queue if not specified
    };

    // Use the solaceService to send the message
    const result = await solaceService.sendMessage(normalizedBody);
    res.status(200).json(result);
  } catch (error) {
    // Log the error and return a standardized error response
    console.error('Error in /send-message endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message', 
      error: error.message 
    });
  }
});

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
