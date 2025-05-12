import { jest } from '@jest/globals';
import defaultConfig from './testConfig.js';
import { SolaceConnectionError, SolaceMessageError, ValidationError } from '../errors.js';

let solclientjs;
let solaceService;
jest.unstable_mockModule('solclientjs', () => {
  // Create mock session
  const mockSession = {
    on: jest.fn((event, callback) => {
      if (event === 'UP_NOTICE') {
        callback();
      }
      return mockSession;
    }),
    connect: jest.fn(),
    send: jest.fn(),
    disconnect: jest.fn(),
    dispose: jest.fn()
  };
  // Create mock message
  const mockMessage = {
    setBinaryAttachment: jest.fn(),
    setProperty: jest.fn(),
    setDeliveryMode: jest.fn(),
    setDestination: jest.fn()
  };
  const mock = {
    SolclientFactory: {
      init: jest.fn(),
      setLogLevel: jest.fn(),
      createSession: jest.fn(() => mockSession),
      createMessage: jest.fn(() => mockMessage),
      createDurableQueueDestination: jest.fn(queueName => ({ name: queueName, type: 'QUEUE' })),
      createTopicDestination: jest.fn(topicName => ({ name: topicName, type: 'TOPIC' })),
      producerDestinationType: {
        QUEUE: 'QUEUE',
        TOPIC: 'TOPIC'
      }
    },
    LogLevel: {
      INFO: 'INFO',
      DEBUG: 'DEBUG',
      ERROR: 'ERROR'
    },
    MessageDeliveryModeType: {
      PERSISTENT: 'PERSISTENT',
      DIRECT: 'DIRECT'
    },
    SessionEventCode: {
      UP_NOTICE: 'UP_NOTICE',
      CONNECT_FAILED_ERROR: 'CONNECT_FAILED_ERROR'
    },
    SolDestinationType: {
      QUEUE: 'QUEUE',
      TOPIC: 'TOPIC'
    },
    SolclientFactoryProfiles: {
      version10: 'version10'
    }
  };
  return { ...mock, default: mock };
});

beforeAll(async () => {
  solclientjs = await import('solclientjs');
  solaceService = await import('../solaceService.js');
});

describe('solaceService', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    // Test 1: Successfully send a message to a queue
    test('should successfully send a message to a queue', async () => {
      // Arrange
      const config = {
        brokerUrl: defaultConfig.brokerUrl,
        vpnName: defaultConfig.vpnName,
        username: defaultConfig.username,
        password: defaultConfig.password,
        destination: defaultConfig.destination,
        payload: defaultConfig.payload,
        isQueue: defaultConfig.isQueue
      };

      // Act
      const result = await solaceService.sendMessage(config);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Message sent successfully'
      });

      // Verify Solace SDK usage
      expect(solclientjs.SolclientFactory.createSession).toHaveBeenCalledWith({
        url: defaultConfig.brokerUrl,
        vpnName: defaultConfig.vpnName,
        userName: defaultConfig.username,
        password: defaultConfig.password
      });

      // Get the mock session from the mock factory
      const mockSession = solclientjs.SolclientFactory.createSession.mock.results[0].value;

      // Verify session operations
      expect(mockSession.on).toHaveBeenCalledTimes(2);
      expect(mockSession.connect).toHaveBeenCalled();
      expect(mockSession.send).toHaveBeenCalled();
      expect(mockSession.disconnect).toHaveBeenCalled();

      // Verify message creation and configuration
      expect(solclientjs.SolclientFactory.createMessage).toHaveBeenCalled();

      // Get the mock message from the mock factory
      const mockMessage = solclientjs.SolclientFactory.createMessage.mock.results[0].value;

      expect(mockMessage.setBinaryAttachment).toHaveBeenCalledWith(defaultConfig.payload);
      expect(mockMessage.setProperty).toHaveBeenCalledWith('JMSXUserID', defaultConfig.username);
      expect(mockMessage.setDeliveryMode).toHaveBeenCalledWith(solclientjs.MessageDeliveryModeType.DIRECT);

      // Verify destination setting
      // With the new implementation, we're using createDurableQueueDestination
      expect(solclientjs.SolclientFactory.createDurableQueueDestination).toHaveBeenCalledWith(defaultConfig.destination);
      const queueDestination = solclientjs.SolclientFactory.createDurableQueueDestination.mock.results[0].value;
      expect(mockMessage.setDestination).toHaveBeenCalledWith(queueDestination);
    });

    // Test 2: Successfully send a message to a topic
    test('should successfully send a message to a topic', async () => {
      // Arrange
      const config = {
        brokerUrl: defaultConfig.brokerUrl,
        vpnName: defaultConfig.vpnName,
        username: defaultConfig.username,
        password: defaultConfig.password,
        destination: defaultConfig.destination,
        payload: defaultConfig.payload,
        isQueue: false // Override to test topic instead of queue
      };

      // Act
      const result = await solaceService.sendMessage(config);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Message sent successfully'
      });

      // Get the mock message from the mock factory
      const mockMessage = solclientjs.SolclientFactory.createMessage.mock.results[0].value;

      // Verify destination setting
      // With the new implementation, we're using createTopicDestination
      expect(solclientjs.SolclientFactory.createTopicDestination).toHaveBeenCalledWith(defaultConfig.destination);
      const topicDestination = solclientjs.SolclientFactory.createTopicDestination.mock.results[0].value;
      expect(mockMessage.setDestination).toHaveBeenCalledWith(topicDestination);
    });

    // Test 3: Successfully send a JSON payload
    test('should successfully send a JSON payload', async () => {
      // Arrange
      const jsonPayload = JSON.parse(defaultConfig.payload);
      const config = {
        brokerUrl: defaultConfig.brokerUrl,
        vpnName: defaultConfig.vpnName,
        username: defaultConfig.username,
        password: defaultConfig.password,
        destination: defaultConfig.destination,
        payload: jsonPayload,
        isQueue: defaultConfig.isQueue
      };

      // Act
      const result = await solaceService.sendMessage(config);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Message sent successfully'
      });

      // Get the mock message from the mock factory
      const mockMessage = solclientjs.SolclientFactory.createMessage.mock.results[0].value;

      // Verify JSON payload handling
      expect(mockMessage.setBinaryAttachment).toHaveBeenCalledWith(JSON.stringify(jsonPayload));
    });

    // Test 4: Handle connection failure
    test('should throw a SolaceConnectionError when connection fails', async () => {
      // Arrange
      const config = {
        brokerUrl: 'ws://invalid-broker', // Using invalid broker URL to trigger connection failure
        vpnName: defaultConfig.vpnName,
        username: defaultConfig.username,
        password: defaultConfig.password,
        destination: defaultConfig.destination,
        payload: defaultConfig.payload,
        isQueue: defaultConfig.isQueue
      };

      // Custom mock session for this test
      const mockSession = {
        on: jest.fn((event, callback) => {
          if (event === 'CONNECT_FAILED_ERROR') {
            callback(new Error('Connection failed'));
          }
          return mockSession;
        }),
        connect: jest.fn(),
        send: jest.fn(),
        disconnect: jest.fn(),
        dispose: jest.fn()
      };
      solclientjs.SolclientFactory.createSession.mockImplementationOnce(() => mockSession);

      // Act & Assert
      try {
        await solaceService.sendMessage(config);
        // If we get here, the test should fail because an error should have been thrown
        fail('Expected an error to be thrown');
      } catch (error) {
        // Assert that the error is a SolaceConnectionError
        expect(error).toBeInstanceOf(SolaceConnectionError);
        // Assert that the error message is correct
        expect(error.message).toBe('Connection to Solace broker failed');
        // Assert that the error details contain the broker URL
        expect(error.details).toHaveProperty('brokerUrl', 'ws://invalid-broker');
      }
    });

    // Test 5: Validate required fields
    test('should throw a ValidationError when required fields are missing', async () => {
      // Arrange - missing brokerUrl
      const config = {
        vpnName: defaultConfig.vpnName,
        username: defaultConfig.username,
        password: defaultConfig.password,
        destination: defaultConfig.destination,
        payload: defaultConfig.payload,
        isQueue: defaultConfig.isQueue
      };

      // Act & Assert
      try {
        await solaceService.sendMessage(config);
        // If we get here, the test should fail because an error should have been thrown
        fail('Expected an error to be thrown');
      } catch (error) {
        // Assert that the error is a ValidationError
        expect(error).toBeInstanceOf(ValidationError);
        // Assert that the error message is correct
        expect(error.message).toBe("Parameter 'brokerUrl' is required and must be a string");
      }
    });
  });
});
