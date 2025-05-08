/**
 * Solace Message Sender Application
 * 
 * A React application that provides a user interface for sending messages to Solace brokers.
 * Allows users to configure connection parameters, message content, and destination types.
 * 
 * @module App
 * @author Solace-Poke Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Get API URL from environment variables with fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050'

/**
 * Main application component
 * Provides a form for configuring and sending messages to Solace brokers
 * 
 * @returns {JSX.Element} The rendered application
 */
function App() {
  /**
   * State for server health information
   * Contains status, port, and timestamp from the server's health endpoint
   * Null when server health hasn't been checked yet
   */
  const [serverInfo, setServerInfo] = useState<{
    status: string;
    port: number;
    timestamp: string;
  } | null>(null);

  /**
   * State for server connection errors
   * Contains error message when server connection fails
   * Null when there are no connection errors
   */
  const [serverError, setServerError] = useState<string | null>(null);

  /**
   * Effect hook to check server health when component mounts
   * Makes a GET request to the server's health endpoint
   * Updates serverInfo on success or serverError on failure
   */
  useEffect(() => {
    /**
     * Asynchronous function to check server health
     * Makes an HTTP request to the server's health endpoint
     * Updates state based on the response
     */
    const checkServerHealth = async () => {
      try {
        // Request server health information
        const response = await axios.get(`${API_URL}/health`);
        // Update server info state with response data
        setServerInfo(response.data);
        // Clear any previous server errors
        setServerError(null);
      } catch (error) {
        // Log the error to console for debugging
        console.error('Error checking server health:', error);
        // Update server error state with user-friendly message
        setServerError('Could not connect to server. Please check if the server is running.');
      }
    };

    // Call the function when component mounts
    checkServerHealth();
  }, []);

  /**
   * Form data state for Solace connection and message parameters
   * Contains all the fields needed to connect to a Solace broker and send a message
   * Initialized with default values for easier testing
   */
  const [formData, setFormData] = useState({
    brokerUrl: 'ws://localhost:8008',  // WebSocket URL for the Solace broker
    vpnName: 'default',                // Message VPN name
    username: 'admin',                 // Authentication username
    password: 'admin',                 // Authentication password
    destination: 'DEAL.IN',            // Queue or topic name
    payload: `{
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
}`,                                    // Default JSON payload example
    isQueue: true                      // Whether destination is a queue (true) or topic (false)
  })

  /**
   * Status state for message sending operation
   * Contains success flag and message text
   * Null when no operation has been performed yet
   */
  const [status, setStatus] = useState<{
    success?: boolean;  // Whether the operation was successful
    message: string;    // Status message to display to the user
  } | null>(null)

  /**
   * Loading state for form submission
   * True while waiting for the server response, false otherwise
   * Used to disable the submit button during submission
   */
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Effect hook to auto-dismiss success messages
   * Sets a timeout to clear the status after 4 seconds when a success message is shown
   * Cleans up the timeout when component unmounts or status changes
   */
  useEffect(() => {
    if (status && status.success) {
      // Set a timeout to clear the status after 4 seconds
      const timer = setTimeout(() => {
        setStatus(null)
      }, 4000)

      // Clean up the timeout when the component unmounts or status changes
      return () => clearTimeout(timer)
    }
  }, [status])

  /**
   * Event handler for form input changes
   * Updates the formData state when any form field changes
   * Handles different input types (text, checkbox, etc.)
   * 
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      // For checkbox inputs, use the checked property instead of value
      const target = e.target as HTMLInputElement
      setFormData({
        ...formData,
        [name]: target.checked
      })
    } else {
      // For all other input types, use the value property
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  /**
   * Event handler for form submission
   * Validates form data, sends the message to the server, and updates status
   * Handles JSON payload parsing and error cases
   * 
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault()
    // Set loading state to show spinner and disable submit button
    setIsLoading(true)
    // Clear any previous status messages
    setStatus(null)

    try {
      // Validate that all required fields are filled
      if (!formData.brokerUrl || !formData.vpnName || !formData.username || !formData.destination || !formData.payload) {
        throw new Error('Please fill in all required fields')
      }

      // Try to parse payload as JSON if it looks like JSON
      let payloadToSend = formData.payload
      if (formData.payload.trim().startsWith('{') && formData.payload.trim().endsWith('}')) {
        try {
          // Parse the payload string to a JSON object
          payloadToSend = JSON.parse(formData.payload)
        } catch {
          // If parsing fails, send as plain text
          console.log('Payload is not valid JSON, sending as plain text')
        }
      }

      // Send the message to the server
      const response = await axios.post(`${API_URL}/send-message`, {
        ...formData,
        payload: payloadToSend
      })

      // Update status with success message from server
      setStatus({
        success: true,
        message: response.data.message || 'Message sent successfully'
      })
    } catch (error) {
      // Log the error to console for debugging
      console.error('Error sending message:', error)

      // Update status with error message
      setStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      })
    } finally {
      // Reset loading state regardless of success or failure
      setIsLoading(false)
    }
  }

  /**
   * Render the application UI
   * Includes server status display, message configuration form, and status messages
   */
  return (
    <div className="app-container">
      <h1>Solace Message Sender</h1>

      {/* Server Health Status Section */}
      <div className="server-status">
        {/* Conditional rendering based on server connection state */}
        {serverError ? (
          // Show error message if server connection failed
          <div className="error-message">{serverError}</div>
        ) : serverInfo ? (
          // Show server info if connection successful
          <div className="success-message">
            Server running on port: {serverInfo.port} | Status: {serverInfo.status}
          </div>
        ) : (
          // Show loading message while checking server status
          <div className="loading-message">Checking server status...</div>
        )}
      </div>

      {/* Message Configuration Form */}
      <form onSubmit={handleSubmit} className="message-form">
        {/* Broker URL Field */}
        <div className="form-group">
          <label htmlFor="brokerUrl">Solace Broker URL *</label>
          <input
            type="text"
            id="brokerUrl"
            name="brokerUrl"
            value={formData.brokerUrl}
            onChange={handleChange}
            placeholder="ws://localhost:8000"
            required
          />
        </div>

        {/* VPN Name Field */}
        <div className="form-group">
          <label htmlFor="vpnName">VPN Name *</label>
          <input
            type="text"
            id="vpnName"
            name="vpnName"
            value={formData.vpnName}
            onChange={handleChange}
            placeholder="default"
            required
          />
        </div>

        {/* Username Field */}
        <div className="form-group">
          <label htmlFor="username">Username *</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="solace-cloud-client"
            required
          />
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="password"
          />
        </div>

        {/* Destination Field */}
        <div className="form-group">
          <label htmlFor="destination">Destination (Queue/Topic) *</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="solace/demo"
            required
          />
        </div>

        {/* Destination Type Selection */}
        <div className="form-group destination-type">
          <label>Destination Type:</label>
          <div className="radio-group">
            {/* Queue Option */}
            <label>
              <input
                type="radio"
                name="isQueue"
                checked={formData.isQueue}
                onChange={() => setFormData({...formData, isQueue: true})}
              />
              Queue
            </label>
            {/* Topic Option */}
            <label>
              <input
                type="radio"
                name="isQueue"
                checked={!formData.isQueue}
                onChange={() => setFormData({...formData, isQueue: false})}
              />
              Topic
            </label>
          </div>
        </div>

        {/* Message Payload Field */}
        <div className="form-group">
          <label htmlFor="payload">Message Payload *</label>
          <textarea
            id="payload"
            name="payload"
            value={formData.payload}
            onChange={handleChange}
            placeholder="Enter text or JSON payload"
            rows={5}
            required
          />
          <small>For JSON, ensure it's properly formatted</small>
        </div>

        {/* Submit Button - Disabled during loading */}
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {/* Status Message - Only shown when status is not null */}
      {status && (
        <div className={`status-message ${status.success ? 'success' : 'error'}`}>
          {status.message}
        </div>
      )}
    </div>
  )
}

export default App
