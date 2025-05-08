import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../index.js';
import solaceService from '../solaceService.js';

// Mock the solaceService module
jest.mock('../solaceService.js');

// Set up the mock implementation before each test
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Set up the mock implementation for sendMessage
  solaceService.sendMessage = jest.fn();
});

describe('POST /send-message', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 and success response for valid payload', async () => {
    // Arrange
    const validPayload = {
      brokerUrl: 'ws://localhost:8000',
      vpn: 'default',
      username: 'test-user',
      password: 'test-password',
      destination: 'test-queue',
      message: 'test message'
    };

    // Mock the solaceService.sendMessage to resolve successfully
    solaceService.sendMessage.mockResolvedValue({
      success: true,
      message: 'Message sent successfully'
    });

    // Act
    const response = await request(app)
      .post('/send-message')
      .send(validPayload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Message sent successfully'
    });

    // Verify solaceService.sendMessage was called with the correct parameters
    expect(solaceService.sendMessage).toHaveBeenCalledWith({
      brokerUrl: validPayload.brokerUrl,
      vpnName: validPayload.vpn,
      username: validPayload.username,
      password: validPayload.password,
      destination: validPayload.destination,
      payload: validPayload.message,
      isQueue: true // Default to queue
    });
  });
});
