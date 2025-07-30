import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

function MerchantManagement() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      
      {error && <div className="alert alert-danger mb-4">{error}</div>}
      
      {loading ? (
        <p>Loading merchants...</p>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full table">
            <thead className="bg-gray-50">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Business Type</th>
                <th>Status</th>
                <th>Actions</th>
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
                    <td>{merchant.id}</td>
                    <td>{merchant.name}</td>
                    <td>{merchant.email}</td>
                    <td>{merchant.business_type}</td>
                    <td>
                      <span className={`badge ${
                        merchant.status === 'approved' ? 'badge-success' :
                        merchant.status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {merchant.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button className="btn btn-sm btn-primary">View</button>
                        <button className="btn btn-sm btn-outline-primary">Edit</button>
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