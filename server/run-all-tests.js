import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

// Function to run a command and return its output
async function runCommand(command) {
  try {
    const { stdout, stderr } = await execPromise(command);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { 
      success: false, 
      stdout: error.stdout, 
      stderr: error.stderr,
      error: error.message 
    };
  }
}

// Function to start the server and return the port it's running on
function startServer() {
  console.log('Starting server...');
  const server = spawn('node', ['server/index.js'], {
    stdio: 'pipe',
    detached: true
  });

  // Variable to store the port the server is running on
  let serverPort = null;

  // Promise to wait for server to start and capture the port
  const portPromise = new Promise((resolve) => {
    // Capture server output
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`Server output: ${output}`);

      // Extract port from server output
      const portMatch = output.match(/Server running on port (\d+)/);
      if (portMatch && portMatch[1]) {
        serverPort = portMatch[1];
        resolve(serverPort);
      }
    });
  });

  server.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });

  // Return both the server process and the promise for the port
  return { server, portPromise };
}

// Function to run all tests
async function runAllTests() {
  console.log('=== Running All Tests ===');

  // Start the server and get the port promise
  const { server, portPromise } = startServer();

  // Wait for server to start and get the port
  const port = await portPromise;
  console.log(`Server detected on port: ${port}`);

  console.log('\n=== Running Server-Side Tests ===');
  const serverTestResult = await runCommand(`NODE_OPTIONS=--experimental-vm-modules PORT=${port} jest --forceExit`);
  console.log('Server-side test results:');
  console.log(serverTestResult.stdout);
  if (serverTestResult.stderr) {
    console.error('Server-side test errors:');
    console.error(serverTestResult.stderr);
  }

  console.log('\n=== Running Health Check Test ===');
  const healthTestResult = await runCommand(`PORT=${port} node server/test-health.js`);
  console.log('Health check test results:');
  console.log(healthTestResult.stdout);
  if (healthTestResult.stderr) {
    console.error('Health check test errors:');
    console.error(healthTestResult.stderr);
  }

  // Kill the server process
  if (server.pid) {
    console.log(`Stopping server (PID: ${server.pid})...`);
    process.kill(-server.pid);
  }

  console.log('\n=== Test Summary ===');
  console.log(`Server-side tests: ${serverTestResult.success ? 'PASSED' : 'FAILED'}`);
  console.log(`Health check test: ${healthTestResult.success ? 'PASSED' : 'FAILED'}`);

  // Exit with appropriate code
  process.exit(serverTestResult.success && healthTestResult.success ? 0 : 1);
}

// Run all tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
