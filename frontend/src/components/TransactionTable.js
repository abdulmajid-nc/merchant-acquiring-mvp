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
                  {tx.merchant_name || 'Loading...'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tx.terminal_id || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tx.created_at ? new Date(tx.created_at).toLocaleString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tx.amount ? `₨${parseFloat(tx.amount).toFixed(2)}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {/* Simple string format instead of complex structure */}
                  {(tx.card_scheme || 'Card') + ' ' + (tx.card_display || (tx.card_number ? tx.card_number.replace('______', ' **** ') : 'N/A'))}
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
