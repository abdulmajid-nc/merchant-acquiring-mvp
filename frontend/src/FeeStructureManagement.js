import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FeeStructureManagement = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    percentageFee: 0,
    fixedFee: 0,
    is_volume_based: false,
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch fee structures from the API
  useEffect(() => {
    const fetchFeeStructures = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/fees');
        setFeeStructures(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load fee structures. Please try again later.');
        setLoading(false);
        console.error('Error fetching fee structures:', err);
      }
    };

    fetchFeeStructures();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Open modal for creating a new fee structure
  const openCreateModal = () => {
    setSelectedFeeStructure(null);
    setFormData({
      name: '',
      description: '',
      percentageFee: 0,
      fixedFee: 0,
      is_volume_based: false,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing fee structure
  const openEditModal = (feeStructure) => {
    setSelectedFeeStructure(feeStructure);
    setFormData({
      name: feeStructure.name,
      description: feeStructure.description,
      percentageFee: feeStructure.fee_rules?.find(rule => rule.rule_type === 'percentage')?.fee_value || 0,
      fixedFee: feeStructure.fee_rules?.find(rule => rule.rule_type === 'fixed')?.fee_value || 0,
      is_volume_based: feeStructure.is_volume_based || false,
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name) {
      setError('Validation Error: Fee structure name is required');
      return;
    }
    
    if (isNaN(parseFloat(formData.percentageFee))) {
      setError('Validation Error: Percentage fee must be a valid number');
      return;
    }
    
    if (isNaN(parseFloat(formData.fixedFee))) {
      setError('Validation Error: Fixed fee must be a valid number');
      return;
    }
    
    // Prepare the data for the API with fee_rules
    const apiData = {
      name: formData.name,
      description: formData.description,
      is_active: true,
      fee_rules: [
        {
          rule_type: 'percentage',
          parameter_name: 'transaction_amount',
          fee_value: parseFloat(formData.percentageFee) || 0
        },
        {
          rule_type: 'fixed',
          parameter_name: 'transaction',
          fee_value: parseFloat(formData.fixedFee) || 0
        }
      ]
    };
    
    try {
      if (selectedFeeStructure) {
        // Update existing fee structure
        const response = await axios.put(`/api/fees/${selectedFeeStructure.id}`, apiData);
        setSuccessMessage('Fee structure updated successfully!');
        
        // Use the actual response data instead of constructing our own object
        const updatedFeeStructure = response.data;
        
        // Update the fee structures list with the data from the server
        setFeeStructures(feeStructures.map(fs => 
          fs.id === selectedFeeStructure.id ? updatedFeeStructure : fs
        ));
      } else {
        // Create new fee structure
        const response = await axios.post('/api/fees', apiData);
        setSuccessMessage('Fee structure created successfully!');
        
        // Add the new fee structure to the list
        setFeeStructures([...feeStructures, response.data]);
      }
      
      // Close the modal
      setIsModalOpen(false);
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details?.message || 
                          err.message || 
                          'Failed to save fee structure. Please try again.';
      
      // Log detailed information for debugging
      console.error('Error saving fee structure:', err);
      
      if (err.response?.status === 400) {
        // Handle validation errors specially
        setError(`Validation Error: ${errorMessage}`);
      } else if (err.response?.status === 404) {
        // Handle not found errors
        setError(`Fee structure not found: ${errorMessage}`);
      } else if (err.response?.status === 503) {
        // Handle database connection errors
        setError(`Database connection error: Please try again later.`);
      } else {
        // Generic error handling
        setError(`Error: ${errorMessage}`);
      }
      
      // Display error details in console for debugging
      if (err.response?.data?.details) {
        console.error('Error details:', err.response.data.details);
      }
      
      // Clear the error message after 8 seconds (increased from 5 to give more time to read)
      setTimeout(() => {
        setError('');
      }, 8000);
    }
  };

  // Handle fee structure deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await axios.delete(`/api/fees/${id}`);
        setSuccessMessage('Fee structure deleted successfully!');
        
        // Remove the deleted fee structure from the list
        setFeeStructures(feeStructures.filter(fs => fs.id !== id));
        
        // Clear the success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 
                            err.response?.data?.details?.message || 
                            err.message || 
                            'Failed to delete fee structure. Please try again.';
        
        // Log detailed information for debugging
        console.error('Error deleting fee structure:', err);
        
        if (err.response?.status === 404) {
          // Handle not found errors
          setError(`Fee structure not found: ${errorMessage}`);
        } else if (err.response?.status === 503) {
          // Handle database connection errors
          setError(`Database connection error: Please try again later.`);
        } else if (err.response?.status === 400) {
          // Handle cases where deletion is not allowed (e.g., due to dependencies)
          setError(`Cannot delete: ${errorMessage}`);
        } else {
          // Generic error handling
          setError(`Error: ${errorMessage}`);
        }
        
        // Display error details in console for debugging
        if (err.response?.data?.details) {
          console.error('Error details:', err.response.data.details);
        }
        
        // Clear the error message after 8 seconds (increased from 5 to give more time to read)
        setTimeout(() => {
          setError('');
        }, 8000);
      }
    }
  };

  // Display loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Fee Structure Management</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
        >
          Add New Fee Structure
        </button>
      </div>

      {/* Error and success messages */}
      {error && (
        <div className={`border px-4 py-3 rounded mb-4 relative flex items-center ${
          error.includes('Validation Error') 
            ? 'bg-yellow-100 border-yellow-400 text-yellow-800' 
            : error.includes('Database connection error') 
            ? 'bg-blue-100 border-blue-400 text-blue-800'
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          <span className="mr-2 text-xl">
            {error.includes('Validation Error') 
              ? '⚠️' 
              : error.includes('Database connection error') 
              ? '⚙️'
              : '❌'}
          </span>
          <span className="block sm:inline flex-grow">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto px-2 py-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Dismiss"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Fee structures list */}
      {feeStructures.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Fee (%)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fixed Fee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume-Based
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeStructures.map((feeStructure) => (
                <tr key={feeStructure.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {feeStructure.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {feeStructure.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Number(feeStructure.fee_rules?.find(rule => rule.rule_type === 'percentage')?.fee_value ?? 0).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${Number(feeStructure.fee_rules?.find(rule => rule.rule_type === 'fixed')?.fee_value ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {feeStructure.is_volume_based ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(feeStructure)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(feeStructure.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                    <Link
                      to={`/fee-structure/${feeStructure.id}/volume-tiers`}
                      className="text-blue-600 hover:text-blue-900 ml-4"
                    >
                      Volume Tiers
                    </Link>
                    <Link
                      to={`/fee-structure/${feeStructure.id}/assign`}
                      className="text-green-600 hover:text-green-900 ml-4"
                    >
                      Assign
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">No fee structures found. Create your first fee structure!</p>
        </div>
      )}

      {/* Modal for creating/editing fee structures */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedFeeStructure ? 'Edit Fee Structure' : 'Create New Fee Structure'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                                <label htmlFor="percentageFee" className="block text-gray-700 text-sm font-medium mb-2">
                  Base Fee Percentage (%)
                </label>
                <input
                  type="number"
                  id="percentageFee"
                  name="percentageFee"
                  value={formData.percentageFee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="fixedFee" className="block text-gray-700 text-sm font-medium mb-2">
                  Base Fixed Fee ($)
                </label>
                <input
                  type="number"
                  id="fixedFee"
                  name="fixedFee"
                  value={formData.fixedFee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_volume_based"
                    checked={formData.is_volume_based}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700 text-sm font-medium">Volume-Based Pricing</span>
                </label>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                >
                  {selectedFeeStructure ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructureManagement;
