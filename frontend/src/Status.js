
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
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2 flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
          Status Check
        </h1>
        <p className="text-gray-500 text-lg">Check the status of any merchant or transaction in real time.</p>
      </header>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 mx-auto max-w-xl border border-gray-100">
        <div className="mb-6">
          <div className="flex w-full mb-4 rounded-lg overflow-hidden shadow-sm" role="group">
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
                className={`w-full text-center py-2 px-4 border border-r-0 rounded-l-lg transition-colors cursor-pointer font-semibold text-base
                  ${statusType === 'merchant' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow' 
                    : 'bg-white text-blue-600 border-gray-300 hover:bg-gray-50'}`}
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
                className={`w-full text-center py-2 px-4 border border-l-0 rounded-r-lg transition-colors cursor-pointer font-semibold text-base
                  ${statusType === 'transaction' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow' 
                    : 'bg-white text-blue-600 border-gray-300 hover:bg-gray-50'}`}
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
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base mb-4 px-4 py-3"
          />
        </div>
        <button 
          type="submit" 
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Check Status
        </button>
        {result && (
          <div className="mt-6">
            <h5 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
              {statusType === 'merchant' ? 'Merchant' : 'Transaction'} Status Result
            </h5>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <pre className="text-sm max-h-60 overflow-auto text-gray-800">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
        {statusType === 'transaction' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mt-4">
            <span className="font-bold">Note:</span> Transaction status functionality has been implemented in this update.
            You can now check both merchant and transaction statuses from this page.
          </div>
        )}
      </form>
    </div>
  );
}
