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
      setMccs(data);
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
      <div className="container-fluid py-4">
        <h1 className="h3 mb-3">Merchant Category Codes (MCC) Management</h1>
        
        {/* Notification alert */}
        {notification.message && (
          <div className={`alert alert-${notification.type} alert-dismissible fade show`} role="alert">
            {notification.message}
            <button type="button" className="btn-close" onClick={() => setNotification({ type: '', message: '' })}></button>
          </div>
        )}
        
        <div className="row">
          {/* MCC List */}
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h5 mb-3">MCC List</h2>
                
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : mccs.length === 0 ? (
                  <div className="alert alert-info">No MCCs found. Add a new MCC using the form.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>MCC Code</th>
                          <th>Description</th>
                          <th>Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mccs.map((mcc) => (
                          <tr key={mcc.code || mcc._id}>
                            <td>{mcc.code}</td>
                            <td>{mcc.description}</td>
                            <td>{mcc.category}</td>
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
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h5 mb-3">Add New MCC</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="mccCode" className="form-label">MCC Code <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validation.code ? 'is-invalid' : ''}`}
                      id="mccCode"
                      name="code"
                      value={newMcc.code}
                      onChange={handleInputChange}
                      placeholder="e.g., 5812"
                      maxLength="4"
                    />
                    {validation.code && <div className="invalid-feedback">{validation.code}</div>}
                    <small className="text-muted">Must be a 4-digit numeric code</small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="mccDescription" className="form-label">Description <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validation.description ? 'is-invalid' : ''}`}
                      id="mccDescription"
                      name="description"
                      value={newMcc.description}
                      onChange={handleInputChange}
                      placeholder="e.g., Restaurants"
                    />
                    {validation.description && <div className="invalid-feedback">{validation.description}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="mccCategory" className="form-label">Category <span className="text-danger">*</span></label>
                    <select
                      className={`form-select ${validation.category ? 'is-invalid' : ''}`}
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
                    {validation.category && <div className="invalid-feedback">{validation.category}</div>}
                  </div>
                  
                  <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary">
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
