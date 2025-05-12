/**
 * Custom hook for managing Solace message form
 */
import { useState } from 'react';
import axios from 'axios';
import { SolaceFormData, StatusMessage, SendMessageResponse } from '../types';
import config from '../config';

/**
 * Hook for managing Solace message form
 * Handles form state, validation, submission, and status messages
 * 
 * @returns {Object} Form state and handlers
 * @returns {SolaceFormData} formData - Current form data
 * @returns {Function} handleChange - Handler for form input changes
 * @returns {Function} handleSubmit - Handler for form submission
 * @returns {StatusMessage|null} status - Status message after submission
 * @returns {boolean} isLoading - Whether form submission is in progress
 * @returns {Function} clearStatus - Function to clear the status message
 */
export function useSolaceForm() {
  // Form data state - use default values from config
  const [formData, setFormData] = useState<SolaceFormData>(config.form);

  // Status message state
  const [status, setStatus] = useState<StatusMessage | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handler for form input changes
   * Updates the formData state when any form field changes
   * 
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      // For checkbox inputs, use the checked property instead of value
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      // For all other input types, use the value property
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  /**
   * Function to clear the status message
   */
  const clearStatus = () => {
    setStatus(null);
  };

  /**
   * Handler for form submission
   * Validates form data, sends the message to the server, and updates status
   * 
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();
    // Set loading state to show spinner and disable submit button
    setIsLoading(true);
    // Clear any previous status messages
    clearStatus();

    try {
      // Validate that all required fields are filled
      if (!formData.brokerUrl || !formData.vpnName || !formData.username || 
          !formData.destination || !formData.payload) {
        throw new Error('Please fill in all required fields');
      }

      // Try to parse payload as JSON if it looks like JSON
      let payloadToSend = formData.payload;
      if (formData.payload.trim().startsWith('{') && formData.payload.trim().endsWith('}')) {
        try {
          // Parse the payload string to a JSON object
          payloadToSend = JSON.parse(formData.payload);
        } catch {
          // If parsing fails, send as plain text
          console.log('Payload is not valid JSON, sending as plain text');
        }
      }

      // Send the message to the server using API URL and endpoint from config
      const response = await axios.post<SendMessageResponse>(
        `${config.api.url}${config.api.endpoints.sendMessage}`, 
        {
          ...formData,
          payload: payloadToSend
        }
      );

      // Update status with success message from server
      setStatus({
        success: true,
        message: response.data.message || 'Message sent successfully'
      });
    } catch (error) {
      // Log the error to console for debugging
      console.error('Error sending message:', error);

      // Update status with error message
      setStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      // Reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    status,
    isLoading,
    clearStatus
  };
}
