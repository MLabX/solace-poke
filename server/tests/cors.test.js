import request from 'supertest';
import express from 'express';
import cors from 'cors';

describe('CORS Configuration', () => {
  let app;

  beforeEach(() => {
    // Create a fresh app instance with the same CORS configuration as the main server
    app = express();

    // Configure CORS with specific options to handle preflight requests
    app.use(cors({
      origin: 'http://localhost:5173', // Allow the frontend origin
      methods: ['GET', 'POST', 'OPTIONS'], // Allow these HTTP methods
      allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
      credentials: true // Allow cookies to be sent with requests
    }));

    app.use(express.json());

    // Add a simple route for testing
    app.post('/send-message', (req, res) => {
      res.status(200).json({ success: true });
    });
  });

  // Test 1: Verify that preflight OPTIONS requests are handled correctly
  test('should handle preflight OPTIONS requests correctly', async () => {
    const response = await request(app)
      .options('/send-message')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');

    // Check status code
    expect(response.status).toBe(204); // No content is the standard response for OPTIONS

    // Check CORS headers
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-methods']).toContain('POST');
    expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  // Test 2: Verify that actual requests from the allowed origin work
  test('should allow requests from the configured origin', async () => {
    const response = await request(app)
      .post('/send-message')
      .set('Origin', 'http://localhost:5173')
      .send({ test: 'data' });

    // Check status code
    expect(response.status).toBe(200);

    // Check CORS headers
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  // Test 3: Verify that requests from other origins are still handled (CORS doesn't block the request, just the browser does)
  test('should handle requests from other origins appropriately', async () => {
    const response = await request(app)
      .post('/send-message')
      .set('Origin', 'http://some-other-origin.com')
      .send({ test: 'data' });

    // The request should still be processed, but the CORS headers should reflect the configured origin
    expect(response.status).toBe(200);

    // In a properly configured CORS setup, the server should either:
    // 1. Not include the Access-Control-Allow-Origin header for disallowed origins, or
    // 2. Set it to the configured origin, not the requesting origin

    // Check that the header is either not present or set to the configured origin
    if (response.headers['access-control-allow-origin']) {
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    }
  });
});
