import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssignFeeStructure = () => {
  const { id } = useParams(); // Fee structure ID
  const navigate = useNavigate();
  const [feeStructure, setFeeStructure] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchants, setSelectedMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch fee structure and merchants data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching fee structure with ID:', id);
        // Fetch fee structure details
        const feeResponse = await axios.get(`/api/fees/${id}`);
        console.log('Fee structure response:', feeResponse.data);
        setFeeStructure(feeResponse.data);
        
        console.log('Fetching merchants data');
        // Fetch all merchants
        const merchantsResponse = await axios.get('/api/merchants');
        console.log('Merchants response:', merchantsResponse.data);
        setMerchants(merchantsResponse.data.merchants || []);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
        console.error('Error details:', err.response ? err.response.data : 'No response data');
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle merchant selection
  const handleMerchantSelection = (merchantId) => {
    if (selectedMerchants.includes(merchantId)) {
      setSelectedMerchants(selectedMerchants.filter(id => id !== merchantId));
    } else {
      setSelectedMerchants([...selectedMerchants, merchantId]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedMerchants.length === 0) {
      setError('Please select at least one merchant.');
      return;
    }
    
    try {
      console.log('Assigning fee structure', id, 'to merchants:', selectedMerchants);
      
      // Assign fee structure to selected merchants
      await Promise.all(
        selectedMerchants.map(merchantId => {
          console.log('Sending assignment request for merchant ID:', merchantId);
          return axios.post('/api/fees/assign', {
            feeStructureId: id,
            merchantId: parseInt(merchantId, 10) // Ensure merchantId is a number
          });
        })
      );
      
      setSuccessMessage('Fee structure assigned successfully!');
      
      // Clear selections and redirect after a delay
      setTimeout(() => {
        navigate('/fee-structure-management');
      }, 2000);
      
    } catch (err) {
      setError('Failed to assign fee structure. Please try again.');
      console.error('Error assigning fee structure:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      }
      console.error('Request config:', err.config);
    }
  };
  
  // Filter merchants based on search term
  const filteredMerchants = Array.isArray(merchants) 
    ? merchants.filter(merchant => 
        merchant.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Display loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!feeStructure) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Fee structure not found.</p>
        </div>
        <button
          onClick={() => navigate('/fee-structure-management')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Fee Structures
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Assign Fee Structure</h1>
          <p className="text-gray-600 mt-2">
            Assigning: <span className="font-semibold">{feeStructure.name}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/fee-structure-management')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
        >
          Back
        </button>
      </div>

      {/* Error and success messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search merchants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Merchant selection list */}
        <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Fee Structure
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className={selectedMerchants.includes(merchant.id) ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedMerchants.includes(merchant.id)}
                        onChange={() => handleMerchantSelection(merchant.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {merchant.name} (ID: {merchant.id})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {merchant.business_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        merchant.status === 'approved' ? 'bg-green-100 text-green-800' :
                        merchant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {merchant.feeStructure ? merchant.feeStructure.name : 'None'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No merchants found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Selected count and action buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedMerchants.length} {selectedMerchants.length === 1 ? 'merchant' : 'merchants'} selected
          </div>
          <div className="space-x-3">
            <button
              type="button"
              onClick={() => navigate('/fee-structure-management')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              disabled={selectedMerchants.length === 0}
            >
              Assign Fee Structure
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssignFeeStructure;
