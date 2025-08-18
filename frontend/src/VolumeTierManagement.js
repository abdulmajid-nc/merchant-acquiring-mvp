import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VolumeTierManagement = () => {
  const { id } = useParams(); // Fee structure ID
  const navigate = useNavigate();
  const [feeStructure, setFeeStructure] = useState(null);
  const [volumeTiers, setVolumeTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    minVolume: 0,
    maxVolume: 0,
    feePercentage: 0,
    feeFixed: 0,
  });

  // Fetch fee structure and volume tiers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch fee structure details
        const feeResponse = await axios.get(`/api/fees/${id}`);
        setFeeStructure(feeResponse.data);
        
        // Use volume tiers from the fee structure
        if (feeResponse.data && feeResponse.data.volume_tiers) {
          setVolumeTiers(feeResponse.data.volume_tiers);
        } else {
          setVolumeTiers([]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, [id]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open modal for creating a new volume tier
  const openCreateModal = () => {
    setSelectedTier(null);
    setFormData({
      minVolume: 0,
      maxVolume: 0,
      feePercentage: 0,
      feeFixed: 0,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing volume tier
  const openEditModal = (tier) => {
    setSelectedTier(tier);
    setFormData({
      minVolume: tier.min_volume,
      maxVolume: tier.max_volume,
      feePercentage: tier.fee_value,
      feeFixed: 0,
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedTier) {
        // Update existing volume tier
        const response = await axios.put(`/api/fees/volume-tiers/${selectedTier.id}`, {
          minVolume: parseFloat(formData.minVolume),
          maxVolume: parseFloat(formData.maxVolume),
          feePercentage: parseFloat(formData.feePercentage),
        });
        setSuccessMessage('Volume tier updated successfully!');
        
        // Update the volume tiers list with the actual response data
        setVolumeTiers(volumeTiers.map(tier => 
          tier.id === selectedTier.id ? response.data : tier
        ));
      } else {
        // Create new volume tier
        const response = await axios.post('/api/fees/volume-tiers', {
          feeStructureId: id,
          minVolume: parseFloat(formData.minVolume),
          maxVolume: parseFloat(formData.maxVolume),
          feePercentage: parseFloat(formData.feePercentage),
        });
        setSuccessMessage('Volume tier created successfully!');
        
        // Add the new volume tier to the list
        setVolumeTiers([...volumeTiers, response.data]);
      }
      
      // Close the modal
      setIsModalOpen(false);
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to save volume tier. Please try again.');
      console.error('Error saving volume tier:', err);
    }
  };

  // Handle volume tier deletion
  const handleDelete = async (tierId) => {
    if (window.confirm('Are you sure you want to delete this volume tier?')) {
      try {
        await axios.delete(`/api/fees/volume-tiers/${tierId}`);
        setSuccessMessage('Volume tier deleted successfully!');
        
        // Remove the deleted volume tier from the list
        setVolumeTiers(volumeTiers.filter(tier => tier.id !== tierId));
        
        // Clear the success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Failed to delete volume tier. Please try again.');
        console.error('Error deleting volume tier:', err);
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
          <h1 className="text-3xl font-bold text-gray-800">Volume Tier Management</h1>
          <p className="text-gray-600 mt-2">
            Fee Structure: <span className="font-semibold">{feeStructure.name}</span>
          </p>
        </div>
        <div className="space-x-3">
          <button
            onClick={() => navigate('/fee-structure-management')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
          >
            Add New Tier
          </button>
        </div>
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
          <button
            onClick={() => setSuccessMessage('')}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Volume tiers list */}
      {volumeTiers.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Volume ($)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Volume ($)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee (%)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fixed Fee ($)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {volumeTiers.map((tier) => (
                <tr key={tier.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${parseFloat(tier.min_volume).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tier.max_volume ? `$${parseFloat(tier.max_volume).toLocaleString()}` : 'Unlimited'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {parseFloat(tier.fee_value).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    $0.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(tier)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tier.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">
            No volume tiers defined for this fee structure. Create your first tier!
          </p>
        </div>
      )}

      {/* Modal for creating/editing volume tiers */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedTier ? 'Edit Volume Tier' : 'Create New Volume Tier'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="minVolume" className="block text-gray-700 text-sm font-medium mb-2">
                  Minimum Volume ($)
                </label>
                <input
                  type="number"
                  id="minVolume"
                  name="minVolume"
                  value={formData.minVolume}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="maxVolume" className="block text-gray-700 text-sm font-medium mb-2">
                  Maximum Volume ($) (0 for unlimited)
                </label>
                <input
                  type="number"
                  id="maxVolume"
                  name="maxVolume"
                  value={formData.maxVolume}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="feePercentage" className="block text-gray-700 text-sm font-medium mb-2">
                  Fee Percentage (%)
                </label>
                <input
                  type="number"
                  id="feePercentage"
                  name="feePercentage"
                  value={formData.feePercentage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="feeFixed" className="block text-gray-700 text-sm font-medium mb-2">
                  Fixed Fee ($)
                </label>
                <input
                  type="number"
                  id="feeFixed"
                  name="feeFixed"
                  value={formData.feeFixed}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
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
                  {selectedTier ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolumeTierManagement;
