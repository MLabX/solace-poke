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

// Function to start the server
function startServer() {
  console.log('Starting server...');
  const server = spawn('node', ['server/index.js'], {
    stdio: 'pipe',
    detached: true
  });

  // Capture server output
  server.stdout.on('data', (data) => {
    console.log(`Server output: ${data}`);
  });

  server.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });

  // Return the server process
  return server;
}

// Function to run all tests
async function runAllTests() {
  console.log('=== Running All Tests ===');

  // Start the server
  const server = startServer();

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\n=== Running Server-Side Tests ===');
  const serverTestResult = await runCommand('NODE_OPTIONS=--experimental-vm-modules jest --forceExit');
  console.log('Server-side test results:');
  console.log(serverTestResult.stdout);
  if (serverTestResult.stderr) {
    console.error('Server-side test errors:');
    console.error(serverTestResult.stderr);
  }

  console.log('\n=== Running Health Check Test ===');
  const healthTestResult = await runCommand('node server/test-health.js');
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
