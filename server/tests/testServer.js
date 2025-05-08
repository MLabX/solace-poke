/**
 * Test server for unit testing
 * This is a simplified version of the server that doesn't import the actual solaceService
 */
import express from 'express';
import cors from 'cors';

/**
 * Creates an Express app with the /send-message endpoint
 * @param {Object} mockSolaceService - Mock implementation of the solaceService
 * @returns {Object} Express app
 */
export function createServer(mockSolaceService) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API endpoint to send message to Solace
  app.post('/send-message', async (req, res) => {
    try {
      // Normalize the request body to handle different field name formats
      const normalizedBody = {
        brokerUrl: req.body.brokerUrl,
        vpnName: req.body.vpnName || req.body.vpn,
        username: req.body.username,
        password: req.body.password,
        destination: req.body.destination,
        payload: req.body.payload || req.body.message,
        isQueue: req.body.isQueue !== undefined ? req.body.isQueue : true // Default to queue if not specified
      };

      // Use the provided mock solaceService with normalized body
      const result = await mockSolaceService.sendMessage(normalizedBody);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in /send-message endpoint:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send message', 
        error: error.message 
      });
    }
  });

  return app;
}

export default createServer;
