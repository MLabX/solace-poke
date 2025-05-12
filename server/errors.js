/**
 * Custom error classes for the Solace Message Sender application
 * Provides specific error types for different failure scenarios
 * 
 * @module errors
 */

/**
 * Base error class for Solace-related errors
 * Extends the standard Error class with additional properties
 */
export class SolaceError extends Error {
  /**
   * Create a new SolaceError
   * @param {string} message - Error message
   * @param {Object} [details=null] - Additional error details
   */
  constructor(message, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    
    // Ensure proper stack trace in modern environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when connection to Solace broker fails
 */
export class SolaceConnectionError extends SolaceError {
  /**
   * Create a new SolaceConnectionError
   * @param {string} message - Error message
   * @param {Object} [details=null] - Additional error details
   */
  constructor(message, details = null) {
    super(message, details);
  }
}

/**
 * Error thrown when message sending fails
 */
export class SolaceMessageError extends SolaceError {
  /**
   * Create a new SolaceMessageError
   * @param {string} message - Error message
   * @param {Object} [details=null] - Additional error details
   */
  constructor(message, details = null) {
    super(message, details);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends Error {
  /**
   * Create a new ValidationError
   * @param {string} message - Error message
   * @param {Object} [details=null] - Additional error details
   */
  constructor(message, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    
    // Ensure proper stack trace in modern environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}