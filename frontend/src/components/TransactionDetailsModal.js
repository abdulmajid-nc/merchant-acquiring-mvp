import React from 'react';
import TransactionStatusBadge from './TransactionStatusBadge';
import formatCurrency from '../utils/formatCurrency';

const TransactionDetailsModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white z-50">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-900">Transaction Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Basic Transaction Info */}
          <div className="col-span-2 bg-gray-50 p-4 rounded">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-medium">{transaction.id || transaction._id}</p>
              </div>
              <TransactionStatusBadge status={transaction.status} />
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-medium text-lg">
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
          </div>

          {/* Date and Time */}
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-600">Date & Time</p>
            <p className="font-medium">
              {new Date(transaction.created_at).toLocaleString()}
            </p>
          </div>

          {/* Merchant Information */}
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-600">Merchant</p>
            <p className="font-medium">{transaction.merchant_name || transaction.merchant?.name || '-'}</p>
            <p className="text-sm text-gray-500">ID: {transaction.merchant_id}</p>
          </div>

          {/* Terminal Information */}
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-600">Terminal</p>
            <p className="font-medium">{transaction.terminal_id}</p>
          </div>

          {/* Card Information */}
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-600">Card Information</p>
            <p className="font-medium">{transaction.card_scheme}</p>
            <p className="text-sm text-gray-500">{transaction.card_number}</p>
          </div>

          {/* Transaction Type */}
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-600">Transaction Type</p>
            <p className="font-medium capitalize">{transaction.transaction_type}</p>
          </div>

          {/* Additional Details */}
          {transaction.approval_code && (
            <div className="p-4 border rounded">
              <p className="text-sm text-gray-600">Approval Code</p>
              <p className="font-medium">{transaction.approval_code}</p>
            </div>
          )}

          {transaction.reference && (
            <div className="p-4 border rounded">
              <p className="text-sm text-gray-600">Reference</p>
              <p className="font-medium">{transaction.reference}</p>
            </div>
          )}

          {transaction.response_code && (
            <div className="p-4 border rounded">
              <p className="text-sm text-gray-600">Response Code</p>
              <p className="font-medium">{transaction.response_code}</p>
            </div>
          )}

          {/* Original Transaction Reference (for refunds/voids) */}
          {transaction.original_transaction && (
            <div className="col-span-2 p-4 border rounded">
              <p className="text-sm text-gray-600">Original Transaction</p>
              <p className="font-medium">{transaction.original_transaction}</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
