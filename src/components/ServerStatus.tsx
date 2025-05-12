/**
 * Server Status Component
 * Displays the current status of the server
 */
import { useServerHealth } from '../hooks/useServerHealth';

/**
 * ServerStatus component
 * Shows the server connection status, including success, error, or loading states
 * 
 * @returns {JSX.Element} The rendered component
 */
export function ServerStatus() {
  const { serverInfo, error, isLoading } = useServerHealth();

  return (
    <div className="server-status">
      {/* Conditional rendering based on server connection state */}
      {error ? (
        // Show error message if server connection failed
        <div className="error-message">{error}</div>
      ) : serverInfo ? (
        // Show server info if connection successful
        <div className="success-message">
          Server running on port: {serverInfo.port} | Status: {serverInfo.status}
        </div>
      ) : (
        // Show loading message while checking server status
        <div className="loading-message">
          {isLoading ? 'Checking server status...' : 'Server status unknown'}
        </div>
      )}
    </div>
  );
}

export default ServerStatus;