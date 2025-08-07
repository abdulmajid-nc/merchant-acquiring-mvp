import React from 'react';
import { TRANSACTION_STATUSES, STATUS_CATEGORIES, getStatusConfig } from '../constants/transactionConstants';

/**
 * TransactionStatusFilter - A component for filtering transactions by status
 *
 * @param {Object} props
 * @param {string} props.selectedStatus - Currently selected status filter
 * @param {Function} props.onStatusChange - Callback when status filter changes
 */
const TransactionStatusFilter = ({ selectedStatus, onStatusChange }) => {
  // Group statuses by category for better organization
  const statusGroups = {
    'All': ['all'],
    'Success': STATUS_CATEGORIES.SUCCESS,
    'In Progress': STATUS_CATEGORIES.WARNING,
    'Failed': STATUS_CATEGORIES.ERROR
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Status Filter
      </label>
      <div className="flex flex-wrap gap-2">
        {/* "All" option */}
        <button
          onClick={() => onStatusChange('all')}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedStatus === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        
        {/* Status options by category */}
        {Object.values(TRANSACTION_STATUSES).map(status => {
          const config = getStatusConfig(status);
          return (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedStatus === status 
                  ? `${config.bg} ${config.text} border-2 border-blue-500` 
                  : `${config.bg} ${config.text} hover:opacity-80`
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionStatusFilter;
