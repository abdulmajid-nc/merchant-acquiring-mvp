import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

import Register from './Register';


function MerchantManagement() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Fetch merchants when component mounts
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.MERCHANTS); // Fixed: using correct uppercase key
      
      // Handle different response formats
      if (Array.isArray(response)) {
        // Direct array response
        setMerchants(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response with data property containing array
        setMerchants(response.data);
      } else if (response && response.merchants && Array.isArray(response.merchants)) {
        // Response with merchants property
        setMerchants(response.merchants);
      } else {
        // Fallback to empty array if no valid format is found
        setMerchants([]);
        console.warn('Unexpected response format for merchants:', response);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching merchants:', err);
      setError('Failed to load merchants. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Merchant Management</h1>


      {/* Register New Merchant Button & Section */}
      <div className="mb-10">
        {!showRegister ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            onClick={() => setShowRegister(true)}
          >
            Register New Merchant
          </button>
        ) : (
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Register New Merchant</h2>
              <button
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => setShowRegister(false)}
              >
                Cancel
              </button>
            </div>
            <Register />
          </div>
        )}
      </div>

      {error && <div className="bg-red-100 text-red-700 rounded px-4 py-2 mb-4">{error}</div>}

      {loading ? (
        <p>Loading merchants...</p>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Business Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">No merchants found</td>
                </tr>
              ) : (
                merchants.map(merchant => (
                  <tr key={merchant.id}>
                    <td className="px-4 py-2">{merchant.id}</td>
                    <td className="px-4 py-2">{merchant.name}</td>
                    <td className="px-4 py-2">{merchant.email}</td>
                    <td className="px-4 py-2">{merchant.business_type}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        merchant.status === 'approved' ? 'bg-green-100 text-green-800' :
                        merchant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">View</button>
                        <button className="px-2 py-1 border border-blue-600 text-blue-600 rounded text-xs">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MerchantManagement;