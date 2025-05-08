import request from 'supertest';
import { jest } from '@jest/globals';
import { createServer } from './testServer.js';
import defaultConfig from './testConfig.js';

// Create a mock solaceService
const mockSolaceService = {
  sendMessage: jest.fn()
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

describe('POST /send-message', () => {
  test('should return 200 and success response for valid payload', async () => {
    // Arrange
    const validPayload = {
      brokerUrl: defaultConfig.brokerUrl,
      vpnName: defaultConfig.vpnName,
      username: defaultConfig.username,
      password: defaultConfig.password,
      destination: defaultConfig.destination,
      payload: defaultConfig.payload,
      isQueue: defaultConfig.isQueue
    };

    // Mock the solaceService.sendMessage to resolve successfully
    mockSolaceService.sendMessage.mockResolvedValue({
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
    expect(mockSolaceService.sendMessage).toHaveBeenCalledWith(validPayload);
  });

  test('should return 200 and success response for valid payload with alternate field names', async () => {
    // Arrange
    const validPayload = {
      brokerUrl: defaultConfig.brokerUrl,
      vpn: defaultConfig.vpnName,
      username: defaultConfig.username,
      password: defaultConfig.password,
      destination: defaultConfig.destination,
      message: defaultConfig.payload
      // isQueue not specified, should default to true
    };

    // Mock the solaceService.sendMessage to resolve successfully
    mockSolaceService.sendMessage.mockResolvedValue({
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

    // Verify solaceService.sendMessage was called with the correct normalized parameters
    expect(mockSolaceService.sendMessage).toHaveBeenCalledWith({
      brokerUrl: validPayload.brokerUrl,
      vpnName: validPayload.vpn,
      username: validPayload.username,
      password: validPayload.password,
      destination: validPayload.destination,
      payload: validPayload.message,
      isQueue: true
    });
  });

  test('should return 500 for invalid input', async () => {
    // Arrange
    const invalidPayload = {
      // Missing required fields
    };

    // Mock the solaceService.sendMessage to reject with validation error
    mockSolaceService.sendMessage.mockRejectedValue(
      new Error('Validation error: Parameter \'brokerUrl\' is required and must be a string')
    );

    // Act
    const response = await request(app)
      .post('/send-message')
      .send(invalidPayload);

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: 'Failed to send message',
      error: 'Validation error: Parameter \'brokerUrl\' is required and must be a string'
    });
  });

  test('should return 500 for Solace connection failure', async () => {
    // Arrange
    const validPayload = {
      brokerUrl: 'ws://invalid-broker', // Using invalid broker URL to trigger connection failure
      vpnName: defaultConfig.vpnName,
      username: defaultConfig.username,
      password: defaultConfig.password,
      destination: defaultConfig.destination,
      payload: defaultConfig.payload,
      isQueue: defaultConfig.isQueue
    };

    // Mock the solaceService.sendMessage to reject with connection error
    mockSolaceService.sendMessage.mockRejectedValue(
      new Error('Connection to Solace broker failed')
    );

    // Act
    const response = await request(app)
      .post('/send-message')
      .send(validPayload);

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: 'Failed to send message',
      error: 'Connection to Solace broker failed'
    });
  });

  test('should return 500 for empty fields', async () => {
    // Arrange
    const emptyFieldsPayload = {
      brokerUrl: '',
      vpnName: '',
      username: '',
      password: '',
      destination: '',
      payload: '',
      isQueue: defaultConfig.isQueue
    };

    // Mock the solaceService.sendMessage to reject with validation error
    mockSolaceService.sendMessage.mockRejectedValue(
      new Error('Validation error: Parameter \'brokerUrl\' is required and must be a string')
    );

    // Act
    const response = await request(app)
      .post('/send-message')
      .send(emptyFieldsPayload);

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: 'Failed to send message',
      error: 'Validation error: Parameter \'brokerUrl\' is required and must be a string'
    });
  });
});
