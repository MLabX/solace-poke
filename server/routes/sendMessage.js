/**
 * Send message route handler
 * Provides an endpoint to send messages to Solace brokers
 * 
 * @module routes/sendMessage
 */

import express from 'express';
import solaceService from '../solaceService.js';
import config from '../config.js';
import { ValidationError, SolaceConnectionError, SolaceMessageError } from '../errors.js';

const router = express.Router();

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
router.post('/', async (req, res) => {
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
      isQueue: req.body.isQueue !== undefined ? req.body.isQueue : config.solace.isQueue // Use configured default if not specified
    };

    // Use the solaceService to send the message
    const result = await solaceService.sendMessage(normalizedBody);
    res.status(200).json(result);
  } catch (error) {
    // Log the error
    console.error('Error in /send-message endpoint:', error);

    // Determine appropriate status code and message based on error type
    let statusCode = 500;
    let responseBody = { 
      success: false, 
      message: 'Failed to send message', 
      error: error.message 
    };

    // Add error details if available
    if (error.details) {
      responseBody.details = error.details;
    }

    // Handle specific error types
    if (error instanceof ValidationError) {
      statusCode = 400; // Bad Request
      responseBody.message = 'Invalid request parameters';
    } else if (error instanceof SolaceConnectionError) {
      statusCode = 503; // Service Unavailable
      responseBody.message = 'Unable to connect to Solace broker';
    } else if (error instanceof SolaceMessageError) {
      statusCode = 500; // Internal Server Error
      responseBody.message = 'Error sending message to Solace broker';
    }

    // Send the response
    res.status(statusCode).json(responseBody);
  }
});

export default router;
