/**
 * Solace messaging service
 * Provides functions for sending messages to Solace brokers
 * 
 * @module solaceService
 */
import pkg from 'solclientjs';
import validators from './validators.js';
import { SolaceConnectionError, SolaceMessageError } from './errors.js';

// Get Solace SDK
const solace = pkg;

// Track initialization state
let isInitialized = false;

/**
 * Ensures the Solace client is initialized before use
 * This prevents errors when accessing enums and factory methods
 */
function ensureInitialized() {
  if (!isInitialized) {
    solace.SolclientFactory.init({ profile: solace.SolclientFactoryProfiles.version10 });
    isInitialized = true;
  }
}

/**
 * Sends a message to a Solace broker
 * @param {Object} config - Configuration for the Solace connection and message
 * @param {string} config.brokerUrl - URL of the Solace broker
 * @param {string} config.vpnName - VPN name
 * @param {string} config.username - Username for authentication
 * @param {string} config.password - Password for authentication
 * @param {string} config.destination - Destination name (queue or topic)
 * @param {string|Object} config.payload - Message payload
 * @param {boolean} config.isQueue - Whether the destination is a queue (true) or topic (false)
 * @returns {Promise<Object>} - Result of the operation
 * @throws {Error} - If validation fails or if there's an error sending the message
 */
export async function sendMessage(config) {
  // Ensure Solace client is initialized
  ensureInitialized();

  // Validate input parameters
  try {
    validators.validateSendMessageParams(config);
  } catch (error) {
    // Rethrow validation errors with additional context
    throw error;
  }

  // Set log level
  solace.SolclientFactory.setLogLevel(solace.LogLevel.INFO);

  const { brokerUrl, vpnName, username, password, destination, payload, isQueue } = config;

  // Create session properties
  const sessionProperties = {
    url: brokerUrl,
    vpnName: vpnName,
    userName: username,
    password: password,
  };

  try {
    // Create session
    const session = solace.SolclientFactory.createSession(sessionProperties);

    let connected = false;

    try {
      // Connect to Solace message broker
      await new Promise((resolve, reject) => {
        // Connection success handler
        session.on(solace.SessionEventCode.UP_NOTICE, () => {
          console.log('Connected to Solace message broker');
          connected = true;
          resolve();
        });

        // Connection failure handler
        session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (error) => {
          console.error('Connection failed', error);
          reject(new SolaceConnectionError('Connection to Solace broker failed', {
            brokerUrl: config.brokerUrl,
            vpnName: config.vpnName,
            originalError: error
          }));
        });

        // Start connection
        session.connect();
      });

      // Create message
      const message = solace.SolclientFactory.createMessage();

      // Set destination
      // Use SolclientFactory.createDurableQueueDestination or createTopicDestination
      // instead of directly accessing SolDestinationType which might not be available
      const destinationType = isQueue ? 'QUEUE' : 'TOPIC';
      if (isQueue) {
        const queueDestination = solace.SolclientFactory.createDurableQueueDestination(destination);
        message.setDestination(queueDestination);
      } else {
        const topicDestination = solace.SolclientFactory.createTopicDestination(destination);
        message.setDestination(topicDestination);
      }

      // Set message payload
      message.setBinaryAttachment(typeof payload === 'object' ? JSON.stringify(payload) : payload);

      // Set delivery mode to DIRECT as recommended
      message.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);

      // Set property only if the method exists
      if (typeof message.setProperty === 'function') {
        message.setProperty('JMSXUserID', username);
      }

      // Send message
      session.send(message);

      return { success: true, message: 'Message sent successfully' };
    } finally {
      // Disconnect from Solace message broker if connected
      if (connected) {
        try {
          console.log('Disconnecting from Solace message broker');
          session.disconnect();
          // Ensure complete cleanup of session resources
          if (typeof session.dispose === 'function') {
            session.dispose();
          }
        } catch (disconnectError) {
          console.error('Error disconnecting from Solace:', disconnectError);
        }
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);

    // If it's already one of our custom errors, just rethrow it
    if (error.name === 'SolaceConnectionError' || error.name === 'SolaceMessageError' || error.name === 'ValidationError') {
      throw error;
    }

    // Otherwise, wrap it in a SolaceMessageError
    throw new SolaceMessageError(`Failed to send message: ${error.message}`, {
      brokerUrl: config.brokerUrl,
      destination: config.destination,
      isQueue: config.isQueue,
      originalError: error
    });
  }
}

export default {
  sendMessage
};
