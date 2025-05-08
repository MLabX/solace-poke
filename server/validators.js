/**
 * Validators for the Solace message sender API
 * Provides functions to validate input parameters
 */

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
 * @returns {Object} - Validation result with success flag and error message if applicable
 */
export function validateSendMessageParams(params) {
  // Check if params is an object
  if (!params || typeof params !== 'object') {
    return {
      valid: false,
      error: 'Parameters must be provided as an object'
    };
  }

  // Required string parameters
  const requiredStringParams = ['brokerUrl', 'vpnName', 'username', 'password', 'destination'];
  for (const param of requiredStringParams) {
    if (!params[param] || typeof params[param] !== 'string') {
      return {
        valid: false,
        error: `Parameter '${param}' is required and must be a string`
      };
    }
  }

  // Check payload
  if (params.payload === undefined || params.payload === null) {
    return {
      valid: false,
      error: "Parameter 'payload' is required"
    };
  }

  // Check isQueue
  if (typeof params.isQueue !== 'boolean') {
    return {
      valid: false,
      error: "Parameter 'isQueue' is required and must be a boolean"
    };
  }

  // All validations passed
  return {
    valid: true
  };
}

export default {
  validateSendMessageParams
};