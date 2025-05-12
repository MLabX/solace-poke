/**
 * Health check route handler
 * Provides an endpoint to check server status
 * 
 * @module routes/health
 */

import express from 'express';

const router = express.Router();

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
router.get('/', (req, res) => {
  const PORT = process.env.PORT || 5050;
  
  res.status(200).json({
    status: 'ok',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

export default router;