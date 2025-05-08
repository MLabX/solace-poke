import axios from 'axios';

// Get the API URL from environment variables or use the default
const API_URL = process.env.VITE_API_URL || 'http://localhost:5050';

async function testHealthEndpoint() {
  try {
    console.log(`Testing health endpoint at ${API_URL}/health...`);
    const response = await axios.get(`${API_URL}/health`);
    console.log('Health check successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Health check failed!');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

// Run the test
testHealthEndpoint()
  .then(success => {
    if (success) {
      console.log('All tests passed!');
      process.exit(0);
    } else {
      console.error('Tests failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });