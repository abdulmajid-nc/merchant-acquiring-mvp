import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * TransactionStatusBadge - A reusable component for displaying transaction statuses
 * with consistent styling based on status type
 * 
 * This is a wrapper around StatusBadge for backward compatibility
 *
 * @param {Object} props
 * @param {string} props.status - Transaction status (e.g., "Approved", "Pending")
 * @param {boolean} props.showIcon - Whether to show status icon (default: true)
 * @param {string} props.size - Size of the badge: "sm", "md", or "lg" (default: "md")
 * @param {boolean} props.highlight - Whether to use the highlighted style (bg-color-500 text-white) (default: false)
 * @param {string} props.className - Additional classes to apply to the badge
 */
const TransactionStatusBadge = ({ 
  status, 
  showIcon = true, 
  size = "md", 
  highlight = false,
  className = ""
}) => {
  return (
    <StatusBadge
      status={status}
      showIcon={showIcon}
      size={size}
      highlight={highlight}
      className={`dark:bg-gray-800 dark:text-gray-100 ${className}`}
    />
  );
};

export default TransactionStatusBadge;
