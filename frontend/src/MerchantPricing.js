import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api, { API_ENDPOINTS } from './utils/api';

function MerchantPricing() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Merchant and pricing state
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  // Pricing state
  const [pricing, setPricing] = useState({
    mdr: '',
    fixedFee: '',
    currencies: [],
    effectiveStartDate: new Date()
  });
  
  // Device assignment state
  const [devices, setDevices] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [assignedDevices, setAssignedDevices] = useState([]);
  const [softPosId, setSoftPosId] = useState('');
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  
  // Tab management
  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' or 'devices'
  
  // Currency options
  const currencyOptions = [
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'KWD', label: 'KWD - Kuwaiti Dinar' },
    { value: 'QAR', label: 'QAR - Qatari Riyal' },
    { value: 'BHD', label: 'BHD - Bahraini Dinar' },
    { value: 'OMR', label: 'OMR - Omani Rial' }
  ];

  // Fetch merchant details and pricing
  useEffect(() => {
    const fetchMerchantData = async () => {
      setLoading(true);
      try {
        // Fetch merchant details
        const merchantData = await api.get(API_ENDPOINTS.MERCHANT(id));
        setMerchant(merchantData);
        
        // Fetch merchant pricing
        const pricingData = await api.get(API_ENDPOINTS.MERCHANT_PRICING(id));
        
        // If pricing data exists, populate the form
        if (pricingData) {
          setPricing({
            mdr: pricingData.mdr || '',
            fixedFee: pricingData.fixedFee || '',
            currencies: pricingData.currencies || [],
            effectiveStartDate: pricingData.effectiveStartDate 
              ? new Date(pricingData.effectiveStartDate) 
              : new Date()
          });
        }
        
        // Fetch all terminals
        const devicesData = await api.get(API_ENDPOINTS.TERMINALS + '?available=true');
        
        // Store all devices
        setDevices(devicesData.terminals || []);
        
        // Get unassigned devices
        const unassigned = devicesData.terminals.filter(device => !device.merchant || device.merchant === '');
        setAvailableDevices(unassigned);
        
        // Fetch devices assigned to this merchant
        const assignedData = await api.get(API_ENDPOINTS.MERCHANT_DEVICES(id));
        setAssignedDevices(assignedData.devices || []);
        
      } catch (error) {
        console.error("Failed to fetch merchant data:", error);
        showError(`Error: ${error.message || 'Failed to load merchant data'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMerchantData();
  }, [id]);
  
  // Handle currency selection
  const handleCurrencyChange = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      option => option.value
    );
    setPricing({
      ...pricing,
      currencies: value
    });
  };
  
  // Handle pricing submission
  const handlePricingSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!pricing.mdr) {
      showError("MDR percentage is required");
      return;
    }
    
    if (!pricing.fixedFee) {
      showError("Fixed transaction fee is required");
      return;
    }
    
    if (pricing.currencies.length === 0) {
      showError("At least one currency must be selected");
      return;
    }
    
    try {
      await api.put(API_ENDPOINTS.MERCHANT_PRICING(id), pricing);
      showSuccess("Pricing plan updated successfully");
    } catch (error) {
      console.error("Failed to update pricing:", error);
      showError(`Error: ${error.message || 'Failed to update pricing'}`);
    }
  };
  
  // Handle device selection for multi-select
  const handleDeviceSelection = (deviceId) => {
    setSelectedDevices(prevSelected => {
      if (prevSelected.includes(deviceId)) {
        return prevSelected.filter(id => id !== deviceId);
      } else {
        return [...prevSelected, deviceId];
      }
    });
  };
  
  // Handle bulk device assignment
  const handleAssignDevices = async () => {
    if (selectedDevices.length === 0 && !softPosId) {
      showError("Please select at least one device or enter a SoftPOS ID");
      return;
    }
    
    try {
      // Create an array of promises for each device assignment
      const assignmentPromises = selectedDevices.map(deviceId => 
        api.post(API_ENDPOINTS.MERCHANT_ASSIGN_DEVICE(id), { deviceId })
      );
      
      // If SoftPOS ID is provided, add it to the assignment
      if (softPosId.trim()) {
        assignmentPromises.push(
          api.post(API_ENDPOINTS.MERCHANT_ASSIGN_DEVICE(id), { 
            deviceId: softPosId,
            deviceType: 'softpos'
          })
        );
      }
      
      // Execute all assignments in parallel
      await Promise.all(assignmentPromises);
      
      // Refresh device lists
      const devicesData = await api.get(API_ENDPOINTS.TERMINALS);
      const unassigned = devicesData.terminals.filter(device => !device.merchant || device.merchant === '');
      setAvailableDevices(unassigned);
      
      const assignedData = await api.get(API_ENDPOINTS.MERCHANT_DEVICES(id));
      setAssignedDevices(assignedData.devices || []);
      
      // Reset selection state
      setSelectedDevices([]);
      setSoftPosId('');
      setShowBulkAssign(false);
      
      showSuccess(`${assignmentPromises.length} device(s) assigned successfully`);
    } catch (error) {
      console.error("Failed to assign devices:", error);
      showError(`Error: ${error.message || 'Failed to assign devices'}`);
    }
  };
  
  // Handle single device assignment (legacy support)
  const handleAssignDevice = async (deviceId) => {
    if (!deviceId) {
      showError("No device selected");
      return;
    }
    
    try {
      await api.post(API_ENDPOINTS.MERCHANT_ASSIGN_DEVICE(id), {
        deviceId
      });
      
      // Refresh device lists
      const devicesData = await api.get(API_ENDPOINTS.TERMINALS);
      const unassigned = devicesData.terminals.filter(device => !device.merchant || device.merchant === '');
      setAvailableDevices(unassigned);
      
      const assignedData = await api.get(API_ENDPOINTS.MERCHANT_DEVICES(id));
      setAssignedDevices(assignedData.devices || []);
      
      showSuccess("Device assigned successfully");
    } catch (error) {
      console.error("Failed to assign device:", error);
      showError(`Error: ${error.message || 'Failed to assign device'}`);
    }
  };
  
  // Handle device removal
  const handleRemoveDevice = async (deviceId) => {
    try {
      await api.post(API_ENDPOINTS.MERCHANT_REMOVE_DEVICE(id), {
        deviceId: deviceId
      });
      
      // Refresh device lists
      const devicesData = await api.get(API_ENDPOINTS.TERMINALS);
      const unassigned = devicesData.terminals.filter(device => !device.merchant || device.merchant === '');
      setAvailableDevices(unassigned);
      
      const assignedData = await api.get(API_ENDPOINTS.MERCHANT_DEVICES(id));
      setAssignedDevices(assignedData.devices || []);
      
      showSuccess("Device removed successfully");
    } catch (error) {
      console.error("Failed to remove device:", error);
      showError(`Error: ${error.message || 'Failed to remove device'}`);
    }
  };
  
  // Notification helpers
  const showSuccess = (message) => {
    setNotification({ type: 'success', message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };
  
  const showError = (message) => {
    setNotification({ type: 'danger', message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/merchant-management">Merchants</Link></li>
          {merchant && (
            <li className="breadcrumb-item">
              <Link to={`/merchant-management?id=${id}`}>{merchant.name}</Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">Pricing & Devices</li>
        </ol>
      </nav>
      
      <h2 className="display-5 fw-bold text-primary mb-4">
        {merchant ? merchant.name : 'Merchant'} <span className="text-secondary fs-4">Pricing & Devices</span>
      </h2>
      
      {/* Merchant Info Card */}
      {merchant && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h3 className="h5 mb-0">Merchant Details</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <p className="mb-1"><strong>Email:</strong> {merchant.email}</p>
              </div>
              <div className="col-md-4">
                <p className="mb-1"><strong>Type:</strong> {merchant.business_type}</p>
              </div>
              <div className="col-md-4">
                <p className="mb-1"><strong>Status:</strong> 
                  <span className={`ms-2 badge bg-${merchant.status === 'active' ? 'success' : 
                    merchant.status === 'suspended' ? 'warning text-dark' : 'danger'}`}>
                    {merchant.status ? merchant.status.charAt(0).toUpperCase() + merchant.status.slice(1) : 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Alert */}
      {notification.message && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show`} role="alert">
          {notification.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setNotification({ type: '', message: '' })}
            aria-label="Close">
          </button>
        </div>
      )}
      
      {/* Tabs Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            <i className="fas fa-dollar-sign me-1"></i>
            Pricing Plan
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            <i className="fas fa-mobile-alt me-1"></i>
            Device Management
            {assignedDevices.length > 0 && (
              <span className="badge bg-primary rounded-pill ms-2">
                {assignedDevices.length}
              </span>
            )}
          </button>
        </li>
      </ul>
      
      {/* Tab Content */}
      {activeTab === 'pricing' && (
        <div className="row">
          <div className="col-md-8 mx-auto mb-4">
            <div className="card h-100">
              <div className="card-header bg-light">
                <h3 className="h5 fw-semibold text-dark mb-0">Pricing Plan</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handlePricingSubmit}>
                  {/* MDR */}
                  <div className="mb-3">
                    <label htmlFor="mdr" className="form-label">MDR (%)</label>
                    <div className="input-group">
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-control" 
                        id="mdr" 
                        value={pricing.mdr} 
                        onChange={(e) => setPricing({...pricing, mdr: e.target.value})}
                        placeholder="e.g., 2.5" 
                        required
                      />
                      <span className="input-group-text">%</span>
                    </div>
                    <small className="text-muted">Merchant Discount Rate percentage</small>
                  </div>
                  
                  {/* Fixed Fee */}
                  <div className="mb-3">
                    <label htmlFor="fixedFee" className="form-label">Fixed Transaction Fee</label>
                    <div className="input-group">
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-control" 
                        id="fixedFee" 
                        value={pricing.fixedFee} 
                        onChange={(e) => setPricing({...pricing, fixedFee: e.target.value})}
                        placeholder="e.g., 0.30" 
                        required
                      />
                      <span className="input-group-text">AED</span>
                    </div>
                    <small className="text-muted">Fixed amount charged per transaction</small>
                  </div>
                  
                  {/* Currencies */}
                  <div className="mb-3">
                    <label htmlFor="currencies" className="form-label">Supported Currencies</label>
                    <select 
                      className="form-select" 
                      id="currencies" 
                      multiple 
                      value={pricing.currencies}
                      onChange={handleCurrencyChange}
                      size="5"
                      required
                    >
                      {currencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">Hold Ctrl/Cmd to select multiple currencies</small>
                  </div>
                  
                  {/* Effective Date */}
                  <div className="mb-4">
                    <label htmlFor="effectiveDate" className="form-label">Effective Start Date</label>
                    <DatePicker
                      selected={pricing.effectiveStartDate}
                      onChange={(date) => setPricing({...pricing, effectiveStartDate: date})}
                      className="form-control"
                      id="effectiveDate"
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date()}
                      required
                    />
                    <small className="text-muted">When this pricing plan goes into effect</small>
                  </div>
                  
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">
                      Update Pricing Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Device Assignment Tab */}
      {activeTab === 'devices' && (
        <div className="row">
          <div className="col-lg-10 mx-auto mb-4">
            <div className="card h-100">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h3 className="h5 fw-semibold text-dark mb-0">Device Management</h3>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowBulkAssign(!showBulkAssign)}
                >
                  {showBulkAssign ? 'Hide Assignment' : 'Assign Devices'}
                </button>
              </div>
              <div className="card-body">
                {/* Bulk Assign Devices Form */}
                {showBulkAssign && (
                  <div className="mb-4 p-3 border rounded bg-light">
                    <h4 className="h6 fw-semibold mb-3">Assign Devices</h4>
                    
                    {/* SoftPOS ID manual entry */}
                    <div className="mb-3">
                      <label htmlFor="softPosId" className="form-label">SoftPOS ID (Manual Entry)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="softPosId"
                        value={softPosId}
                        onChange={(e) => setSoftPosId(e.target.value)}
                        placeholder="Enter SoftPOS ID"
                      />
                      <small className="text-muted">Manually enter a SoftPOS ID to assign</small>
                    </div>
                    
                    {/* Available POS Terminals */}
                    <div className="mb-3">
                      <label className="form-label">Available POS Terminals</label>
                      {availableDevices.length === 0 ? (
                        <div className="alert alert-info py-2">
                          No available terminals found
                        </div>
                      ) : (
                        <div className="table-responsive" style={{maxHeight: '200px', overflowY: 'auto'}}>
                          <table className="table table-sm table-hover">
                            <thead className="table-light sticky-top">
                              <tr>
                                <th style={{width: '40px'}}></th>
                                <th>Serial</th>
                                <th>Model</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {availableDevices.map(device => (
                                <tr key={device.id || device._id} 
                                    className={selectedDevices.includes(device.id || device._id) ? 'table-primary' : ''}
                                    onClick={() => handleDeviceSelection(device.id || device._id)}>
                                  <td>
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`device-${device.id || device._id}`}
                                        checked={selectedDevices.includes(device.id || device._id)}
                                        onChange={() => handleDeviceSelection(device.id || device._id)}
                                      />
                                    </div>
                                  </td>
                                  <td>{device.serial || '—'}</td>
                                  <td>{device.model || 'Unknown'}</td>
                                  <td>
                                    <span className={`badge bg-${
                                      device.status === 'active' ? 'success' : 
                                      device.status === 'pending' ? 'warning text-dark' : 
                                      'secondary'}`}>
                                      {device.status ? 
                                        device.status.charAt(0).toUpperCase() + device.status.slice(1) : 
                                        'Unknown'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <small className="text-muted">Select multiple devices using checkboxes</small>
                    </div>
                    
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-primary" 
                        onClick={handleAssignDevices}
                        disabled={selectedDevices.length === 0 && !softPosId.trim()}
                      >
                        Assign {selectedDevices.length > 0 ? `(${selectedDevices.length})` : ''} {softPosId.trim() ? '+ SoftPOS' : ''}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Quick Assign Device (Legacy support) */}
                {!showBulkAssign && (
                  <div className="mb-4">
                    <h4 className="h6 fw-semibold mb-3">Quick Assign Device</h4>
                    <div className="input-group mb-3">
                      <select 
                        className="form-select"
                        onChange={(e) => e.target.value && handleAssignDevice(e.target.value)}
                        value=""
                      >
                        <option value="">Select a device...</option>
                        {availableDevices.map(device => (
                          <option key={device.id || device._id} value={device.id || device._id}>
                            {device.serial || device.id || device._id} - {device.model || 'Unknown Model'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <small className="text-muted">Click "Assign Devices" for multi-select options</small>
                  </div>
                )}
                
                {/* Assigned Devices List */}
                <div>
                  <h4 className="h6 fw-semibold mb-3">
                    Assigned Devices
                    {assignedDevices.length > 0 && 
                      <span className="badge bg-primary rounded-pill ms-2">{assignedDevices.length}</span>
                    }
                  </h4>
                  {assignedDevices.length === 0 ? (
                    <div className="alert alert-info">
                      No devices assigned to this merchant yet.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Serial/ID</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedDevices.map(device => (
                            <tr key={device.id || device._id}>
                              <td>
                                {device.serial || device.id || device._id}
                                {device.deviceType === 'softpos' && 
                                  <span className="badge bg-info text-dark ms-2">SoftPOS</span>
                                }
                              </td>
                              <td>{device.model || (device.deviceType === 'softpos' ? 'SoftPOS' : '—')}</td>
                              <td>
                                <span className={`badge bg-${
                                  device.status === 'active' ? 'success' : 
                                  device.status === 'pending' ? 'warning text-dark' : 
                                  'secondary'}`}>
                                  {device.status ? 
                                    device.status.charAt(0).toUpperCase() + device.status.slice(1) : 
                                    'Unknown'}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemoveDevice(device.id || device._id)}
                                >
                                  Remove
                                </button>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default MerchantPricing;
