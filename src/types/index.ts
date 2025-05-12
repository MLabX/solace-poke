/**
 * Type definitions for the Solace Message Sender application
 */

/**
 * Server health information returned by the health endpoint
 */
export interface ServerInfo {
  status: string;
  port: number;
  timestamp: string;
}

/**
 * Form data for sending a message to Solace
 */
export interface SolaceFormData {
  brokerUrl: string;
  vpnName: string;
  username: string;
  password: string;
  destination: string;
  payload: string;
  isQueue: boolean;
}

/**
 * Status message for form submission
 */
export interface StatusMessage {
  success?: boolean;
  message: string;
}

/**
 * API response for send-message endpoint
 */
export interface SendMessageResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
}
