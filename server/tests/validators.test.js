import { validateSendMessageParams } from '../validators.js';
import { ValidationError } from '../errors.js';

describe('validators', () => {
  describe('validateSendMessageParams', () => {
    // Test 1: Valid parameters
    test('should not throw for valid parameters', () => {
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

      // Act & Assert
      expect(() => validateSendMessageParams(params)).not.toThrow();
    });

    // Test 2: Valid parameters with JSON payload
    test('should not throw for valid parameters with JSON payload', () => {
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

      // Act & Assert
      expect(() => validateSendMessageParams(params)).not.toThrow();
    });

    // Test 3: Missing params object
    test('should throw ValidationError for missing params object', () => {
      // Act & Assert
      expect(() => validateSendMessageParams(null))
        .toThrow(ValidationError);

      expect(() => validateSendMessageParams(null))
        .toThrow('Parameters must be provided as an object');
    });

    // Test 4: Missing required string parameter
    test('should throw ValidationError for missing required string parameter', () => {
      // Arrange - missing brokerUrl
      const params = {
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: 'test message',
        isQueue: true
      };

      // Act & Assert
      expect(() => validateSendMessageParams(params))
        .toThrow(ValidationError);

      expect(() => validateSendMessageParams(params))
        .toThrow("Parameter 'brokerUrl' is required and must be a string");
    });

    // Test 5: Non-string required parameter
    test('should throw ValidationError for non-string required parameter', () => {
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

      // Act & Assert
      expect(() => validateSendMessageParams(params))
        .toThrow(ValidationError);

      expect(() => validateSendMessageParams(params))
        .toThrow("Parameter 'vpnName' is required and must be a string");
    });

    // Test 6: Missing payload
    test('should throw ValidationError for missing payload', () => {
      // Arrange
      const params = {
        brokerUrl: 'ws://localhost:8000',
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        isQueue: true
      };

      // Act & Assert
      expect(() => validateSendMessageParams(params))
        .toThrow(ValidationError);

      expect(() => validateSendMessageParams(params))
        .toThrow("Parameter 'payload' is required");
    });

    // Test 7: Missing isQueue
    test('should throw ValidationError for missing isQueue', () => {
      // Arrange
      const params = {
        brokerUrl: 'ws://localhost:8000',
        vpnName: 'default',
        username: 'test-user',
        password: 'test-password',
        destination: 'test-queue',
        payload: 'test message'
      };

      // Act & Assert
      expect(() => validateSendMessageParams(params))
        .toThrow(ValidationError);

      expect(() => validateSendMessageParams(params))
        .toThrow("Parameter 'isQueue' is required and must be a boolean");
    });

    // Test 8: Non-boolean isQueue
    test('should throw ValidationError for non-boolean isQueue', () => {
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

      // Act & Assert
      expect(() => validateSendMessageParams(params))
        .toThrow(ValidationError);

      expect(() => validateSendMessageParams(params))
        .toThrow("Parameter 'isQueue' is required and must be a boolean");
    });
  });
});
