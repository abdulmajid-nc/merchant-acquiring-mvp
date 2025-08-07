import React from 'react';
import { getStatusConfig } from '../constants/transactionConstants';

/**
 * TransactionStatusBadge - A reusable component for displaying transaction statuses
 * with consistent styling based on status type
 *
 * @param {Object} props
 * @param {string} props.status - Transaction status (e.g., "Approved", "Pending")
 * @param {boolean} props.showIcon - Whether to show status icon (default: true)
 * @param {string} props.size - Size of the badge: "sm", "md", or "lg" (default: "md")
 */
const TransactionStatusBadge = ({ status, showIcon = true, size = "md" }) => {
  // Get styling configuration based on status
  const config = getStatusConfig(status);
  
  // Size-based classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };
  
  // Normalize status text for display
  const normalizedStatus = typeof status === 'string' 
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : 'Unknown';
  
  return (
    <span className={`inline-flex items-center rounded ${config.bg} ${config.text} font-medium ${sizeClasses[size] || sizeClasses.md}`}>
      {showIcon && (
        <span className="mr-1">
          {/* Simple status indicators - in a real app, you'd use an icon library like FontAwesome or Heroicons */}
          {config.icon === 'check-circle' && '✓'}
          {config.icon === 'x-circle' && '✕'}
          {config.icon === 'clock' && '⏱'}
          {config.icon === 'arrow-left' && '↩'}
          {config.icon === 'arrow-up' && '↑'}
          {config.icon === 'check' && '✓'}
          {config.icon === 'alert-triangle' && '⚠'}
          {config.icon === 'x' && '✕'}
          {config.icon === 'slash' && '∅'}
        </span>
      )}
      {normalizedStatus}
    </span>
  );
};

export default TransactionStatusBadge;
