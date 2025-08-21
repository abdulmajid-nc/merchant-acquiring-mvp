import React from 'react';
import TransactionStatusBadge from './TransactionStatusBadge';
import formatCurrency from '../utils/formatCurrency';
import TRANSACTION_TYPE_LABELS from '../constants/transactionTypeLabels';

const TransactionDetailsModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-80 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800 z-50">
        <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

  <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Basic Transaction Info */}
          <div className="col-span-2 bg-gray-50 dark:bg-gray-900 p-4 rounded">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Transaction ID</p>
                <p className="font-medium dark:text-white">{transaction.id || transaction._id}</p>
              </div>
              <TransactionStatusBadge status={transaction.status} />
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="p-4 border rounded dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Amount</p>
            <p className="font-medium text-lg dark:text-white">
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
          </div>

          {/* Date and Time */}
          <div className="p-4 border rounded dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Date & Time</p>
            <p className="font-medium dark:text-white">
              {new Date(transaction.created_at).toLocaleString()}
            </p>
          </div>

          {/* Merchant Information */}
          <div className="p-4 border rounded dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Merchant</p>
            <p className="font-medium dark:text-white">{transaction.merchant_name || transaction.merchant?.name || '-'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {transaction.merchant_id}</p>
          </div>

          {/* Terminal Information */}
          <div className="p-4 border rounded dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Terminal</p>
            <p className="font-medium dark:text-white">{transaction.terminal_id}</p>
          </div>

          {/* Card Information */}
          <div className="p-4 border rounded dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Card Information</p>
            <p className="font-medium dark:text-white">{transaction.card_scheme || 'Card'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {transaction.card_display || 
               (transaction.card_number ? transaction.card_number.replace('______', ' **** ') : 'N/A')}
            </p>
          </div>

          {/* Transaction Type */}
          <div className="p-4 border rounded dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Transaction Type</p>
            <p className="font-medium dark:text-white">
              {TRANSACTION_TYPE_LABELS[transaction.transaction_type] || transaction.transaction_type || 'Unknown'}
            </p>
          </div>

          {/* Additional Details */}
          {transaction.approval_code && (
            <div className="p-4 border rounded dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">Approval Code</p>
              <p className="font-medium dark:text-white">{transaction.approval_code}</p>
            </div>
          )}

          {transaction.reference && (
            <div className="p-4 border rounded dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">Reference</p>
              <p className="font-medium dark:text-white">{transaction.reference}</p>
            </div>
          )}

          {transaction.response_code && (
            <div className="p-4 border rounded dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">Response Code</p>
              <p className="font-medium dark:text-white">{transaction.response_code}</p>
            </div>
          )}

          {/* Original Transaction Reference (for refunds/voids) */}
          {transaction.original_transaction && (
            <div className="col-span-2 p-4 border rounded dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">Original Transaction</p>
              <p className="font-medium dark:text-white">{transaction.original_transaction}</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
