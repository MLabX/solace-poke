/**
 * Frontend Configuration
 * Centralized configuration for the Solace Message Sender frontend
 * 
 * This file provides default configuration values that can be overridden
 * by environment variables. It follows the pattern of having sensible defaults
 * with the ability to customize for different environments.
 * 
 * @module config
 */

import { SolaceFormData } from './types';

// API configuration
export const apiConfig = {
  // API URL (can be overridden with VITE_API_URL env var)
  url: import.meta.env.VITE_API_URL || 'http://localhost:5050',
  
  // API endpoints
  endpoints: {
    health: '/health',
    sendMessage: '/send-message'
  }
};

// Default form values for the Solace message form
export const defaultFormValues: SolaceFormData = {
  // WebSocket URL for the Solace broker
  // In a real production environment, this should be set via environment variables
  brokerUrl: import.meta.env.VITE_DEFAULT_BROKER_URL || 'ws://localhost:8008',
  
  // Message VPN name
  vpnName: import.meta.env.VITE_DEFAULT_VPN_NAME || 'default',
  
  // Authentication username
  username: import.meta.env.VITE_DEFAULT_USERNAME || 'admin',
  
  // Authentication password
  password: import.meta.env.VITE_DEFAULT_PASSWORD || 'admin',
  
  // Queue or topic name
  destination: import.meta.env.VITE_DEFAULT_DESTINATION || 'DEAL.IN',
  
  // Default JSON payload example
  payload: import.meta.env.VITE_DEFAULT_PAYLOAD || `{
    "airline": "ExampleAirline",
    "region": "Ontario",
    "requestId": 44334,
    "flight": {
        "flightModel": "boeing737",
        "flightRoute": "international"
    },
    "items": [
        {
            "origin": "yow",
            "destination": "ewr",
            "status": "boarding"
        }
    ],
    "totalPassengers": 300,
    "lastUpdated": "2024-01-05T14:30:00"
}`,
  
  // Whether destination is a queue (true) or topic (false)
  isQueue: import.meta.env.VITE_DEFAULT_IS_QUEUE === 'false' ? false : true
};

export default {
  api: apiConfig,
  form: defaultFormValues
};