/**
 * Custom hook for checking server health
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ServerInfo } from '../types';
import config from '../config';

/**
 * Hook for checking server health
 * Makes a GET request to the server's health endpoint
 * Returns server info and error state
 * 
 * @returns {Object} Server health information and error state
 * @returns {ServerInfo|null} serverInfo - Server health information if available
 * @returns {string|null} error - Error message if server connection failed
 * @returns {boolean} isLoading - Whether the health check is in progress
 */
export function useServerHealth() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Asynchronous function to check server health
     * Makes an HTTP request to the server's health endpoint
     * Updates state based on the response
     */
    const checkServerHealth = async () => {
      try {
        // Request server health information using API URL and endpoint from config
        const response = await axios.get<ServerInfo>(
          `${config.api.url}${config.api.endpoints.health}`
        );
        // Update server info state with response data
        setServerInfo(response.data);
        // Clear any previous server errors
        setError(null);
      } catch (err) {
        // Log the error to console for debugging
        console.error('Error checking server health:', err);
        // Update server error state with user-friendly message
        setError('Could not connect to server. Please check if the server is running.');
      } finally {
        setIsLoading(false);
      }
    };

    // Call the function when component mounts
    checkServerHealth();
  }, []);

  return { serverInfo, error, isLoading };
}
