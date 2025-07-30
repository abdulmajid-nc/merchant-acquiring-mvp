
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { API_ENDPOINTS } from './utils/api';

export default function Status() {
  const [id, setId] = useState('');
  const [statusType, setStatusType] = useState('merchant'); // 'merchant' or 'transaction'
  const [result, setResult] = useState(null);

  const checkStatus = async () => {
    try {
      if (statusType === 'merchant') {
        const data = await api.get(API_ENDPOINTS.MERCHANT_BY_ID(id));
        
        // Handle different response formats
        if (data && (data.id || data.name)) {
          // Direct merchant object
          setResult(data);
        } else if (data && data.merchant) {
          // Merchant wrapped in merchant property
          setResult(data.merchant);
        } else {
          console.warn('Unexpected merchant response format:', data);
          setResult(data || { message: 'Received empty response' });
        }
      } else if (statusType === 'transaction') {
        // Now we have a transaction endpoint
        const data = await api.get(API_ENDPOINTS.TRANSACTION_BY_ID(id));
        
        // Handle different response formats
        if (data && data.id) {
          // Direct transaction object
          setResult(data);
        } else if (data && data.transaction) {
          // Transaction wrapped in transaction property
          setResult(data.transaction);
        } else {
          console.warn('Unexpected transaction response format:', data);
          setResult(data || { message: 'Received empty response' });
        }
      }
    } catch (error) {
      console.error(`Failed to check ${statusType} status:`, error);
      setResult({ error: `Failed to fetch ${statusType} status. Please try again.` });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await checkStatus();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mx-auto mt-4 max-w-xl">
        <h2 className="text-xl font-bold text-primary-600 mb-4 text-center">Status Check</h2>
        
        <div className="mb-4">
          <div className="flex w-full mb-4 rounded-md overflow-hidden" role="group">
            <div className="w-1/2">
              <input 
                type="radio" 
                className="sr-only peer" 
                name="statusType" 
                id="merchantStatus" 
                autoComplete="off" 
                checked={statusType === 'merchant'} 
                onChange={() => setStatusType('merchant')}
              />
              <label 
                className={`w-full text-center py-2 px-4 border border-r-0 rounded-l-md transition-colors cursor-pointer
                  ${statusType === 'merchant' 
                    ? 'bg-primary-600 text-white border-primary-600' 
                    : 'bg-white text-primary-600 border-gray-300 hover:bg-gray-50'}`}
                htmlFor="merchantStatus"
              >
                Merchant Status
              </label>
            </div>
            
            <div className="w-1/2">
              <input 
                type="radio" 
                className="sr-only peer" 
                name="statusType" 
                id="transactionStatus" 
                autoComplete="off" 
                checked={statusType === 'transaction'} 
                onChange={() => setStatusType('transaction')}
              />
              <label 
                className={`w-full text-center py-2 px-4 border border-l-0 rounded-r-md transition-colors cursor-pointer
                  ${statusType === 'transaction' 
                    ? 'bg-primary-600 text-white border-primary-600' 
                    : 'bg-white text-primary-600 border-gray-300 hover:bg-gray-50'}`}
                htmlFor="transactionStatus"
              >
                Transaction Status
              </label>
            </div>
          </div>
          
          <input 
            name="id" 
            placeholder={statusType === 'merchant' ? "Merchant ID" : "Transaction ID"} 
            onChange={e => setId(e.target.value)} 
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm mb-4" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Check Status
        </button>
        
        {result && (
          <div className="mt-4">
            <h5 className="text-lg font-medium text-gray-900 mb-2">{statusType === 'merchant' ? 'Merchant' : 'Transaction'} Status Result:</h5>
            <div className="bg-gray-50 p-4 rounded">
              <pre className="text-sm max-h-60 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
        
        {statusType === 'transaction' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mt-4">
            <span className="font-bold">Note:</span> Transaction status functionality has been implemented in this update.
            You can now check both merchant and transaction statuses from this page.
          </div>
        )}
      </form>
    </div>
  );
}
