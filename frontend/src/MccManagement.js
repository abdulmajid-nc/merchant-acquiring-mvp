import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

function MccManagement() {
  const [mccs, setMccs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  // Form state
  const [newMcc, setNewMcc] = useState({
    code: '',
    description: '',
    category: ''
  });
  
  // Form validation
  const [validation, setValidation] = useState({
    code: '',
    description: '',
    category: ''
  });

  // Categories for dropdown (can be expanded or fetched from API)
  const categories = [
    'Retail',
    'Food & Beverage',
    'Healthcare',
    'Travel',
    'Education',
    'Financial Services',
    'Entertainment',
    'Utilities',
    'Other'
  ];

  // Fetch MCCs on component mount
  useEffect(() => {
    fetchMccs();
  }, []);

  const fetchMccs = async () => {
    setLoading(true);
    try {
      const data = await api.get(API_ENDPOINTS.MCCS);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        // Direct array response
        setMccs(data);
      } else if (data && data.mccs && Array.isArray(data.mccs)) {
        // Response with mccs property containing array
        setMccs(data.mccs);
      } else {
        console.warn('Unexpected response format for MCCs:', data);
        setMccs([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to fetch MCCs:", err);
      setError("Failed to load MCCs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMcc({
      ...newMcc,
      [name]: value
    });
    
    // Clear validation error when user types
    if (validation[name]) {
      setValidation({
        ...validation,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newValidation = { code: '', description: '', category: '' };
    
    // MCC Code validation - must be 4 digit numeric
    if (!/^\d{4}$/.test(newMcc.code)) {
      newValidation.code = 'MCC must be a 4-digit numeric code';
      isValid = false;
    }
    
    // Description validation - cannot be empty
    if (!newMcc.description.trim()) {
      newValidation.description = 'Description is required';
      isValid = false;
    }
    
    // Category validation - cannot be empty
    if (!newMcc.category.trim()) {
      newValidation.category = 'Category is required';
      isValid = false;
    }
    
    setValidation(newValidation);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      await api.post(API_ENDPOINTS.MCCS, newMcc);
      
      // Reset form after successful submission
      setNewMcc({
        code: '',
        description: '',
        category: ''
      });
      
      // Show success notification
      showSuccess('MCC added successfully!');
      
      // Refresh the MCC list
      fetchMccs();
      
    } catch (err) {
      console.error("Failed to add MCC:", err);
      showError(`Failed to add MCC: ${err.message}`);
    }
  };

  // Notification helpers
  const showSuccess = (msg) => {
    setNotification({ type: 'success', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };
  
  const showError = (msg) => {
    setNotification({ type: 'danger', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  return (
      <div>
        {/* Page header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Merchant Category Codes (MCC) Management</h1>
          </div>
        </div>
        
        {/* Notification alert */}
        {notification.message && (
          <div className={`mb-6 px-4 py-3 rounded-md flex items-center ${
            notification.type === 'success' ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-800 border-l-4 border-green-600' : 
            notification.type === 'danger' ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-800 border-l-4 border-red-600' : 
            'bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-800 border-l-4 border-blue-600'
          }`} role="alert">
            <div className="flex-grow">{notification.message}</div>
            <button 
              type="button" 
              className="ml-auto rounded-md inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 focus:outline-none" 
              onClick={() => setNotification({ type: '', message: '' })}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* MCC List */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-800">MCC List</h2>
                  <span className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-bold py-1 px-3 rounded-full">
                    {mccs.length} Codes
                  </span>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                    <span className="ml-3 text-gray-500">Loading data...</span>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : mccs.length === 0 ? (
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">No MCCs found. Add a new MCC using the form.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider">MCC Code</th>
                          <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider">Description</th>
                          <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {mccs.map((mcc) => (
                          <tr key={mcc.code || mcc._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gradient-to-br from-blue-50 to-purple-50 text-blue-800">
                                {mcc.code}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{mcc.description}</td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                {mcc.category}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Add New MCC Form */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800">Add New MCC</h2>
                  <p className="text-sm text-gray-500 mt-1">Create a new merchant category code</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="mccCode" className="block text-sm font-medium text-gray-700 mb-1">
                      MCC Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className={`pl-10 pr-4 py-2 block w-full rounded-md shadow-sm ${validation.code ? 
                          'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500' :
                          'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                        id="mccCode"
                        name="code"
                        value={newMcc.code}
                        onChange={handleInputChange}
                        placeholder="e.g., 5812"
                        maxLength="4"
                      />
                    </div>
                    {validation.code && (
                      <div className="mt-2 flex items-center text-sm text-red-600">
                        <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validation.code}
                      </div>
                    )}
                    <p className="mt-2 text-sm text-gray-500">Must be a 4-digit numeric code</p>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="mccDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className={`pl-10 pr-4 py-2 block w-full rounded-md shadow-sm ${validation.description ? 
                          'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500' :
                          'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                        id="mccDescription"
                        name="description"
                        value={newMcc.description}
                        onChange={handleInputChange}
                        placeholder="e.g., Restaurants"
                      />
                    </div>
                    {validation.description && (
                      <div className="mt-2 flex items-center text-sm text-red-600">
                        <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validation.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="mccCategory" className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </div>
                      <select
                        className={`pl-10 pr-10 py-2 block w-full rounded-md shadow-sm appearance-none ${validation.category ? 
                          'border-red-300 text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500' :
                          'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                        id="mccCategory"
                        name="category"
                        value={newMcc.category}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {validation.category && (
                      <div className="mt-2 flex items-center text-sm text-red-600">
                        <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validation.category}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <button 
                      type="submit" 
                      className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add MCC
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default MccManagement;
