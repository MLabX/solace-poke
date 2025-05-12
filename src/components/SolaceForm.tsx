/**
 * Solace Form Component
 * Provides a form for configuring and sending messages to Solace brokers
 */
import { useSolaceForm } from '../hooks/useSolaceForm';
import StatusMessage from './StatusMessage';

/**
 * SolaceForm component
 * Renders a form with fields for Solace connection parameters and message content
 * Handles form submission and displays status messages
 * 
 * @returns {JSX.Element} The rendered component
 */
export function SolaceForm() {
  const { 
    formData, 
    handleChange, 
    handleSubmit, 
    status, 
    isLoading, 
    clearStatus 
  } = useSolaceForm();

  return (
    <>
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
                onChange={() => handleChange({
                  target: { name: 'isQueue', value: true, type: 'checkbox' }
                } as React.ChangeEvent<HTMLInputElement>)}
              />
              Queue
            </label>
            {/* Topic Option */}
            <label>
              <input
                type="radio"
                name="isQueue"
                checked={!formData.isQueue}
                onChange={() => handleChange({
                  target: { name: 'isQueue', value: false, type: 'checkbox' }
                } as React.ChangeEvent<HTMLInputElement>)}
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
      <StatusMessage status={status} onClear={clearStatus} />
    </>
  );
}

export default SolaceForm;