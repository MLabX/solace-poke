import request from 'supertest';
import { jest } from '@jest/globals';
import { createServer } from './testServer.js';

// Create a mock solaceService
const mockSolaceService = {
  sendMessage: jest.fn().mockImplementation(async (config) => {
    // Default implementation returns success
    return { success: true, message: 'Message sent successfully' };
  })
};

// Create a test app
let app;

// Setup and teardown
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Create a fresh app instance using our test server
  app = createServer(mockSolaceService);
});

describe('Server API', () => {
  describe('POST /send-message', () => {
    // Test 1: Successfully send a message
    test('should successfully send a message', async () => {
      // Arrange
      const requestBody = {
        brokerUrl: 'ws://localhost:8000',
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: 'test message',
        isQueue: true
      };

      // Act
      const response = await request(app)
        .post('/send-message')
        .send(requestBody);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Message sent successfully'
      });

      // Verify mockSolaceService was called with the correct parameters
      expect(mockSolaceService.sendMessage).toHaveBeenCalledWith(requestBody);
    });

    // Test 2: Handle service error
    test('should handle service errors', async () => {
      // Arrange
      const requestBody = {
        brokerUrl: 'ws://invalid-broker',
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: 'test message',
        isQueue: true
      };

      // Mock the service to throw an error
      mockSolaceService.sendMessage.mockRejectedValueOnce(new Error('Connection to Solace broker failed'));

      // Act
      const response = await request(app)
        .post('/send-message')
        .send(requestBody);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to send message',
        error: 'Connection to Solace broker failed'
      });

      // Verify mockSolaceService was called with the correct parameters
      expect(mockSolaceService.sendMessage).toHaveBeenCalledWith(requestBody);
    });

    // Test 3: Handle invalid request
    test('should handle invalid requests', async () => {
      // Arrange - empty request body
      const requestBody = {};

      // Mock the service to throw an error for invalid input
      mockSolaceService.sendMessage.mockRejectedValueOnce(new Error('Invalid request parameters'));

      // Act
      const response = await request(app)
        .post('/send-message')
        .send(requestBody);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to send message',
        error: 'Invalid request parameters'
      });

      // Verify mockSolaceService was called with the normalized parameters
      expect(mockSolaceService.sendMessage).toHaveBeenCalledWith({
        brokerUrl: undefined,
        vpnName: undefined,
        username: undefined,
        password: undefined,
        destination: undefined,
        payload: undefined,
        isQueue: true
      });
    });

    // Test 4: Handle JSON payload
    test('should handle JSON payload', async () => {
      // Arrange
      const jsonPayload = { key: 'value', nested: { data: 123 } };
      const requestBody = {
        brokerUrl: 'ws://localhost:8000',
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: jsonPayload,
        isQueue: true
      };

      // Act
      const response = await request(app)
        .post('/send-message')
        .send(requestBody);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Message sent successfully'
      });

      // Verify mockSolaceService was called with the correct parameters
      expect(mockSolaceService.sendMessage).toHaveBeenCalledWith(requestBody);
    });
  });
});
