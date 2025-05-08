/**
 * Configuration for Solace connection parameters used in tests
 * These values can be overridden by environment variables
 */

const defaultConfig = {
  // Solace connection parameters
  brokerUrl: process.env.TEST_BROKER_URL || 'ws://localhost:8008',
  vpnName: process.env.TEST_VPN_NAME || 'default',
  username: process.env.TEST_USERNAME || 'admin',
  password: process.env.TEST_PASSWORD || 'admin',
  destination: process.env.TEST_DESTINATION || 'DEAL.IN',
  isQueue: process.env.TEST_IS_QUEUE !== 'false', // Default to true unless explicitly set to 'false'
  
  // Default message payload
  payload: process.env.TEST_PAYLOAD || JSON.stringify({
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
  }, null, 2)
};

export default defaultConfig;