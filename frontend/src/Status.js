
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
        setResult(data);
      } else if (statusType === 'transaction') {
        // Now we have a transaction endpoint
        const data = await api.get(API_ENDPOINTS.TRANSACTION_BY_ID(id));
        setResult(data);
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
      <form onSubmit={handleSubmit} className="card p-4 mx-auto mt-4" style={{ maxWidth: '600px' }}>
        <h2 className="h4 fw-bold text-primary mb-3 text-center">Status Check</h2>
        
        <div className="mb-3">
          <div className="btn-group w-100 mb-3" role="group">
            <input 
              type="radio" 
              className="btn-check" 
              name="statusType" 
              id="merchantStatus" 
              autoComplete="off" 
              checked={statusType === 'merchant'} 
              onChange={() => setStatusType('merchant')}
            />
            <label className="btn btn-outline-primary" htmlFor="merchantStatus">Merchant Status</label>
            
            <input 
              type="radio" 
              className="btn-check" 
              name="statusType" 
              id="transactionStatus" 
              autoComplete="off" 
              checked={statusType === 'transaction'} 
              onChange={() => setStatusType('transaction')}
            />
            <label className="btn btn-outline-primary" htmlFor="transactionStatus">Transaction Status</label>
          </div>
          
          <input 
            name="id" 
            placeholder={statusType === 'merchant' ? "Merchant ID" : "Transaction ID"} 
            onChange={e => setId(e.target.value)} 
            className="form-control mb-3" 
          />
        </div>

        <button type="submit" className="btn btn-primary fw-bold w-100">Check Status</button>
        
        {result && (
          <div className="mt-3">
            <h5 className="mb-2">{statusType === 'merchant' ? 'Merchant' : 'Transaction'} Status Result:</h5>
            <pre className="bg-light rounded p-3 text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
        
        {statusType === 'transaction' && (
          <div className="alert alert-info mt-3">
            <strong>Note:</strong> Transaction status functionality has been implemented in this update.
            You can now check both merchant and transaction statuses from this page.
          </div>
        )}
      </form>
    </div>
  );
}
