# Solace Message Sender Application

A full-stack application for sending messages to a Solace PubSub+ broker. This application uses React for the frontend and Node.js (Express) for the backend.

## Features

### Frontend (React + TypeScript)
- Form with fields for Solace broker connection details:
  - Broker URL
  - VPN name
  - Username
  - Password
  - Destination (Queue or Topic)
  - Message payload (text or JSON)
- Support for both Queue and Topic destinations
- JSON payload validation
- Success/error message display
- Server health status display with actual port information
- Environment variable configuration via Vite
- Modular component architecture with:
  - Reusable UI components
  - Custom React hooks for form handling and API calls
  - TypeScript interfaces for type safety

### Backend (Node.js + Express)
- RESTful API endpoint for sending messages to Solace
- Health-check endpoint for monitoring server status
- Integration with Solace JavaScript SDK (solclientjs)
- Comprehensive error handling with custom error classes
- Modular route organization
- Input validation with detailed error messages
- Environment variable configuration
- Dynamic port allocation with fallback

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Solace PubSub+ broker (cloud or local)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solace-poke.git
cd solace-poke
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Backend Configuration

The backend server uses environment variables for configuration. You can modify the `.env` file in the `server` directory:

```
PORT=5050
```

### Frontend Configuration

The frontend uses environment variables for API URL configuration. Create or modify the `.env` file in the root directory:

```
VITE_API_URL=http://localhost:5050
```

This environment variable will be injected into the client bundle during build time.

## Running the Application

To start both the frontend and backend servers concurrently:

```bash
npm start
```

This will start:
- The React frontend on http://localhost:5173
- The Express backend on http://localhost:5050 (or the next available port if 5050 is in use)

The server includes automatic port conflict resolution. If port 5050 is already in use, the server will automatically try the next available port.

The frontend includes a health-check feature that displays the actual port the server is running on, making it easy to verify the connection.

To run only the frontend:

```bash
npm run dev
```

To run only the backend:

```bash
npm run server
```

## Testing

The application includes comprehensive test coverage for both the frontend and backend components.

### Running All Tests

To run all tests (both server-side and health check):

```bash
npm run test:all
```

This will:
1. Start the server in the background
2. Run all server-side tests
3. Run the health check test
4. Provide a summary of the test results

Alternatively, to run only the server-side tests:

```bash
npm test
```

### Running Specific Tests

To run specific tests:

```bash
npm test -- <test-file-path>
```

For example:

```bash
npm test -- server/tests/validators.test.js
```

### Health Check Test

To verify that the server is running correctly and check which port it's using:

```bash
npm run test:health
```

This will make a request to the health-check endpoint and display the server status, including the actual port being used.

The test suite includes:
- Unit tests for validators and utility functions
- Integration tests for API endpoints
- Tests for CORS configuration
- Tests for error handling and edge cases
- Health-check test for server status and port verification

## Testing Approach

### Solace SDK Mocking
- All tests that interact with Solace use ESM mocking for the `solclientjs` SDK.
- The tests do **not** connect to a real Solace broker. Instead, the Solace SDK is fully mocked using Jest's `unstable_mockModule`.
- The mock provides both top-level and `default` exports, so both `import solclientjs from 'solclientjs'` and property access like `solclientjs.LogLevel` work.
- The mock session's `.on` method simulates connection events (e.g., `UP_NOTICE` for success, `CONNECT_FAILED_ERROR` for failure) to test all code paths reliably.
- This approach ensures tests are deterministic, fast, and do not require network or broker setup.

### Test Coverage
- The test suite covers validators, API endpoints, error handling, and edge cases.
- Integration tests for `/send-message` and health check endpoints are included.
- Tests for CORS, server startup, and port conflict handling are present.
- All tests are run with `npm run test:all` and are expected to pass without external dependencies.

## Usage

1. Open your browser and navigate to http://localhost:5173
2. Fill in the form with your Solace broker details:
   - Broker URL (e.g., `ws://localhost:8000` or `wss://mr-connection-abcde.messaging.solace.cloud:443`)
   - VPN Name (e.g., `default`)
   - Username and Password
   - Destination name (Queue or Topic)
   - Message payload (text or JSON)
3. Select whether the destination is a Queue or Topic
4. Click "Send Message"
5. View the success or error message

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create a production-ready build in the `dist` directory.

## Support

For support or questions about this application, please contact: mic.devuse@gmail.com
