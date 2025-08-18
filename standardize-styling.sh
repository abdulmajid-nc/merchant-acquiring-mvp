#!/bin/bash
# Script to fix styling inconsistencies between Analytics and Admin Panel

echo "Applying styling standardization..."

# Create common components
mkdir -p frontend/src/components

# Create the StatsCard component
cat > frontend/src/components/StatsCard.js << 'EOF'
import React from 'react';

/**
 * Standardized StatsCard component to ensure consistent styling
 * across different parts of the application.
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.change - Change indicator (e.g., "+12.5%")
 * @param {string} props.period - Period descriptor (e.g., "vs last month")
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.iconColor - Color class for the icon (e.g., "text-green-600")
 */
const StatsCard = ({ 
  title, 
  value, 
  change, 
  period, 
  icon, 
  iconColor = "text-blue-600" 
}) => {
  // Determine if change is positive or negative
  const isPositiveChange = change && change.startsWith('+');
  const changeColorClass = isPositiveChange ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h6 className="text-gray-500 text-sm font-medium">{title}</h6>
        {icon && (
          <div className={iconColor}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">{value}</h2>
        {change && (
          <div className="flex items-center">
            <span className={`text-xs px-2 py-0.5 rounded-full ${changeColorClass}`}>
              {change}
            </span>
            {period && <span className="text-gray-500 text-xs ml-2">{period}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
EOF

# Create the TransactionTable component
cat > frontend/src/components/TransactionTable.js << 'EOF'
import React from 'react';
import TransactionStatusBadge from './TransactionStatusBadge';

/**
 * Standardized TransactionTable component to ensure consistent styling
 * across different parts of the application.
 * 
 * @param {Object} props
 * @param {Array} props.transactions - Array of transaction objects
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {Function} props.onViewDetails - Handler for view details action
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.emptyMessage - Message to display when no transactions
 */
const TransactionTable = ({ 
  transactions = [], 
  showActions = false, 
  onViewDetails = () => {}, 
  loading = false,
  emptyMessage = "No transactions found."
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terminal</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            {showActions && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 8 : 7} className="px-6 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr key={tx._id || tx.id || 'unknown'} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                  {tx._id || tx.id || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tx.merchant_name || (tx.merchant && typeof tx.merchant === 'object' ? tx.merchant.name : tx.merchant) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tx.terminal_id || (tx.terminal && typeof tx.terminal === 'object' ? tx.terminal.serial_number : tx.terminal) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(tx.timestamp || tx.created_at) ? new Date(tx.timestamp || tx.created_at).toLocaleString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {typeof tx.amount === 'number' || typeof tx.amount === 'string' ? 
                    `$${parseFloat(tx.amount).toFixed(2)}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.masked_pan || tx.card_number || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <TransactionStatusBadge status={tx.status} size="sm" />
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onViewDetails(tx)} 
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      View
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
EOF

echo "Created standardized components:"
echo "- frontend/src/components/StatsCard.js"
echo "- frontend/src/components/TransactionTable.js"

# Update imports in Analytics.js
sed -i '/^import React/a import TransactionTable from "./components/TransactionTable";\nimport StatsCard from "./components/StatsCard";' frontend/src/Analytics.js

# Update imports in AdminPanel.js
sed -i '/^import React/a import TransactionTable from "./components/TransactionTable";\nimport StatsCard from "./components/StatsCard";' frontend/src/AdminPanel.js

echo "Updated imports in Analytics.js and AdminPanel.js"

echo "Instructions to complete the integration:"
echo "1. Replace card components in Analytics.js with <StatsCard> components"
echo "2. Replace transaction tables in Analytics.js with <TransactionTable> components"
echo "3. Replace card components in AdminPanel.js with <StatsCard> components"
echo "4. Replace transaction tables in AdminPanel.js with <TransactionTable> components"
echo "5. Replace status badges with <StatusBadge> or <TransactionStatusBadge> components"
echo "6. Test the application to ensure consistent styling"

# Create the StatusBadge component if it doesn't exist
if [ ! -f frontend/src/components/StatusBadge.js ]; then
  cat > frontend/src/components/StatusBadge.js << 'EOF'
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
    : `${config.bg} ${config.text}`;
  
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
EOF

  echo "Created StatusBadge component"
fi

# Check for non-standardized status badges
echo "Checking for non-standardized status badges..."
grep -r "className=\"bg-.*-[0-9]* text-.*" --include="*.js" --include="*.jsx" frontend/src | grep -v "StatusBadge\|TransactionStatusBadge"
echo "The above lines may contain non-standardized status badges. Consider replacing them with StatusBadge component."

echo "Styling standardization applied successfully!"
