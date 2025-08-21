import React from 'react';
import { getStatusConfig } from '../constants/transactionConstants';

/**
 * StatusBadge - A reusable component for displaying statuses
 * with consistent styling based on status type
 *
 * @param {Object} props
 * @param {string} props.status - Status text (e.g., "Approved", "Operational")
 * @param {boolean} props.showIcon - Whether to show status icon (default: true)
 * @param {string} props.size - Size of the badge: "sm", "md", or "lg" (default: "md")
 * @param {boolean} props.highlight - Whether to use the highlighted style (bg-color-500 text-white) (default: false)
 * @param {string} props.className - Additional classes to apply to the badge
 */
const StatusBadge = ({ 
  status, 
  showIcon = true, 
  size = "md",
  highlight = false,
  className = ""
}) => {
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
  
  // Use alternative highlight classes if available and highlight is true
  const styleClasses = highlight && config.altClasses 
    ? config.altClasses
    : `${config.bg} ${config.text}${config.bgDark ? ` dark:${config.bgDark}` : ""}${config.textDark ? ` dark:${config.textDark}` : ""}`;
  
  return (
    <span className={`inline-flex items-center rounded font-medium ${styleClasses} ${sizeClasses[size] || sizeClasses.md} ${className}`}>
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
          {config.icon === 'shield' && '🛡️'}
          {config.icon === 'shield-off' && '⚠️'}
          {config.icon === 'tool' && '🔧'}
        </span>
      )}
      {normalizedStatus}
    </span>
  );
};

export default StatusBadge;
