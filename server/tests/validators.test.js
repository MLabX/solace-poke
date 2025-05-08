import { validateSendMessageParams } from '../validators.js';

describe('validators', () => {
  describe('validateSendMessageParams', () => {
    // Test 1: Valid parameters
    test('should return valid=true for valid parameters', () => {
      // Arrange
      const params = {
        brokerUrl: 'ws://localhost:8000',
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: 'test message',
        isQueue: true
      };

      // Act
      const result = validateSendMessageParams(params);

      // Assert
      expect(result).toEqual({ valid: true });
    });

    // Test 2: Valid parameters with JSON payload
    test('should return valid=true for valid parameters with JSON payload', () => {
      // Arrange
      const params = {
        brokerUrl: 'ws://localhost:8000',
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: { key: 'value' },
        isQueue: true
      };

      // Act
      const result = validateSendMessageParams(params);

      // Assert
      expect(result).toEqual({ valid: true });
    });

    // Test 3: Missing params object
    test('should return valid=false for missing params object', () => {
      // Act
      const result = validateSendMessageParams(null);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: 'Parameters must be provided as an object'
      });
    });

    // Test 4: Missing required string parameter
    test('should return valid=false for missing required string parameter', () => {
      // Arrange - missing brokerUrl
      const params = {
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: 'test message',
        isQueue: true
      };

      // Act
      const result = validateSendMessageParams(params);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: "Parameter 'brokerUrl' is required and must be a string"
      });
    });

    // Test 5: Non-string required parameter
    test('should return valid=false for non-string required parameter', () => {
      // Arrange - vpnName is a number
      const params = {
        brokerUrl: 'ws://localhost:8000',
        vpnName: 123,
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: 'test message',
        isQueue: true
      };

      // Act
      const result = validateSendMessageParams(params);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: "Parameter 'vpnName' is required and must be a string"
      });
    });

    // Test 6: Missing payload
    test('should return valid=false for missing payload', () => {
      // Arrange
      const params = {
        brokerUrl: 'ws://localhost:8000',
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        isQueue: true
      };

      // Act
      const result = validateSendMessageParams(params);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: "Parameter 'payload' is required"
      });
    });

    // Test 7: Missing isQueue
    test('should return valid=false for missing isQueue', () => {
      // Arrange
      const params = {
        brokerUrl: 'ws://localhost:8000',
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: 'test message'
      };

      // Act
      const result = validateSendMessageParams(params);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: "Parameter 'isQueue' is required and must be a boolean"
      });
    });

    // Test 8: Non-boolean isQueue
    test('should return valid=false for non-boolean isQueue', () => {
      // Arrange
      const params = {
        brokerUrl: 'ws://localhost:8000',
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: 'test message',
        isQueue: 'true' // string instead of boolean
      };

      // Act
      const result = validateSendMessageParams(params);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: "Parameter 'isQueue' is required and must be a boolean"
      });
    });
  });
});