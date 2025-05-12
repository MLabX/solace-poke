/**
 * Validators for the Solace message sender API
 * Provides functions to validate input parameters
 * 
 * @module validators
 */

import { ValidationError } from './errors.js';

/**
 * Validates the parameters for sending a message to Solace
 * @param {Object} params - The parameters to validate
 * @param {string} params.brokerUrl - URL of the Solace broker
 * @param {string} params.vpnName - VPN name
 * @param {string} params.username - Username for authentication
 * @param {string} params.password - Password for authentication
 * @param {string} params.destination - Destination name (queue or topic)
 * @param {string|Object} params.payload - Message payload
 * @param {boolean} params.isQueue - Whether the destination is a queue (true) or topic (false)
 * @throws {ValidationError} - If validation fails
 */
export function validateSendMessageParams(params) {
  // Check if params is an object
  if (!params || typeof params !== 'object') {
    throw new ValidationError('Parameters must be provided as an object');
  }

  // Required string parameters
  const requiredStringParams = ['brokerUrl', 'vpnName', 'username', 'password', 'destination'];
  for (const param of requiredStringParams) {
    if (!params[param] || typeof params[param] !== 'string') {
      throw new ValidationError(`Parameter '${param}' is required and must be a string`);
    }
  }

  // Check payload
  if (params.payload === undefined || params.payload === null) {
    throw new ValidationError("Parameter 'payload' is required");
  }

  // Check isQueue
  if (typeof params.isQueue !== 'boolean') {
    throw new ValidationError("Parameter 'isQueue' is required and must be a boolean");
  }

  // All validations passed - no need to return anything as we throw on error
}

export default {
  validateSendMessageParams
};
