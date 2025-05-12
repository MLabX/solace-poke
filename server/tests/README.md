# Solace Test Configuration

This document describes the configuration for Solace connection parameters used in tests.

## Overview

The test files have been updated to use configurable parameters instead of hardcoded values. This allows for easier testing with different Solace environments.

## Configuration

The default values for Solace connection parameters are defined in `testConfig.js`:

```javascript
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
```

## Environment Variables

You can override the default values by setting the following environment variables:

- `TEST_BROKER_URL`: Solace Broker URL (default: "ws://localhost:8008")
- `TEST_VPN_NAME`: VPN Name (default: "default")
- `TEST_USERNAME`: Username (default: "admin")
- `TEST_PASSWORD`: Password (default: "admin")
- `TEST_DESTINATION`: Destination (Queue/Topic) (default: "DEAL.IN")
- `TEST_IS_QUEUE`: Destination Type (default: true for Queue, set to "false" for Topic)
- `TEST_PAYLOAD`: Message Payload (default: JSON object as shown above)

## Usage

The test files import the configuration from `testConfig.js` and use the values in the test cases:

```javascript
import defaultConfig from './testConfig.js';

// Example usage
const validPayload = {
  brokerUrl: defaultConfig.brokerUrl,
  vpnName: defaultConfig.vpnName,
  username: defaultConfig.username,
  password: defaultConfig.password,
  destination: defaultConfig.destination,
  payload: defaultConfig.payload,
  isQueue: defaultConfig.isQueue
};
```

## Running Tests

To run the tests with the default configuration:

```bash
npm test
```

To run the tests with custom configuration, set the environment variables before running the tests:

```bash
TEST_BROKER_URL=ws://my-solace-broker:8008 TEST_VPN_NAME=my-vpn npm test
```

## ESM Mocking Approach

The tests use Jest's `unstable_mockModule` to mock the Solace SDK (solclientjs). This approach:

1. Creates a complete mock of the Solace SDK with all necessary methods and properties
2. Simulates connection events like `UP_NOTICE` and `CONNECT_FAILED_ERROR`
3. Allows testing of all code paths without requiring a real Solace broker
4. Ensures tests are deterministic, fast, and reliable

Example of the mocking approach:

```javascript
jest.unstable_mockModule('solclientjs', () => {
  // Create mock session, message, and other Solace objects
  const mockSession = {
    on: jest.fn((event, callback) => {
      if (event === 'UP_NOTICE') {
        callback();
      }
      return mockSession;
    }),
    connect: jest.fn(),
    // ... other methods
  };

  // Return the mock implementation
  const mock = {
    SolclientFactory: {
      // ... factory methods
    },
    // ... other properties
  };
  return { ...mock, default: mock };
});
```

## Support

For questions or issues related to testing configuration, please contact: mic.devuse@gmail.com
