/**
 * Status Message Component
 * Displays success or error messages after form submission
 */
import { useEffect } from 'react';
import { StatusMessage as StatusMessageType } from '../types';

/**
 * Props for the StatusMessage component
 */
interface StatusMessageProps {
  status: StatusMessageType | null;
  onClear?: () => void;
  autoDismissTime?: number;
}

/**
 * StatusMessage component
 * Shows success or error messages with appropriate styling
 * Automatically dismisses success messages after a specified time
 * 
 * @param {StatusMessageProps} props - Component props
 * @returns {JSX.Element | null} The rendered component or null if no status
 */
export function StatusMessage({ 
  status, 
  onClear, 
  autoDismissTime = 4000 
}: StatusMessageProps) {
  // Auto-dismiss success messages after specified time
  useEffect(() => {
    // Only set up the timer if we have a success status and a clear function
    if (status?.success && onClear) {
      const timer = setTimeout(() => {
        onClear();
      }, autoDismissTime);

      // Clean up the timeout when the component unmounts or status changes
      return () => clearTimeout(timer);
    }
    // No cleanup needed if we didn't set a timer
    return undefined;
  }, [status, onClear, autoDismissTime]);

  // If no status, don't render anything
  if (!status) return null;

  return (
    <div className={`status-message ${status.success ? 'success' : 'error'}`}>
      {status.message}
    </div>
  );
}

export default StatusMessage;
