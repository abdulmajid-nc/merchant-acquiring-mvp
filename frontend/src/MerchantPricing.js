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

  // Notification style mapper for Argon Dashboard
  const getNotificationStyle = type => {
    switch(type) {
      case 'success':
        return {
          bgClass: 'bg-gradient-to-tl from-emerald-500 to-teal-400',
          iconClass: 'ni ni-check-bold'
        };
      case 'danger':
        return {
          bgClass: 'bg-gradient-to-tl from-red-500 to-red-400',
          iconClass: 'ni ni-notification-70'
        };
      case 'info':
        return {
          bgClass: 'bg-gradient-to-tl from-blue-500 to-violet-500',
          iconClass: 'ni ni-bell-55'
        };
      default:
        return {
          bgClass: 'bg-white',
          iconClass: 'ni ni-bell-55'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative flex flex-col min-w-0 break-words bg-white mb-6 shadow-soft-xl rounded-2xl bg-clip-border p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <svg className="animate-spin h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="url(#gradient)" strokeWidth="4"></circle>
              <path className="opacity-75" fill="url(#gradient)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3B82F6' }} />
                <stop offset="100%" style={{ stopColor: '#8B5CF6' }} />
              </linearGradient>
            </defs>
          </div>
          <h6 className="mb-2 text-xl font-bold">Loading pricing data...</h6>
          <p className="mb-0 text-sm text-slate-500">Please wait while we retrieve merchant information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 py-6">
      {/* Breadcrumbs */}
      <nav className="flex mb-5" aria-label="breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/merchant-management" className="text-sm font-normal leading-normal text-slate-700 hover:text-slate-900">
              <i className="ni ni-shop mr-2"></i>
              Merchants
            </Link>
          </li>
          {merchant && (
            <li>
              <div className="flex items-center text-sm">
                <i className="ni ni-bold-right text-slate-400 mx-2 text-xs"></i>
                <Link to={`/merchant-management?id=${id}`} className="font-normal leading-normal text-slate-700 hover:text-slate-900">{merchant.name}</Link>
              </div>
            </li>
          )}
          <li>
            <div className="flex items-center text-sm">
              <i className="ni ni-bold-right text-slate-400 mx-2 text-xs"></i>
              <span className="font-normal leading-normal text-slate-500">Pricing & Devices</span>
            </div>
          </li>
        </ol>
      </nav>
      
      <h2 className="text-2xl font-bold mb-4">
        <span className="bg-gradient-to-tl from-blue-600 to-violet-600 bg-clip-text text-transparent">{merchant ? merchant.name : 'Merchant'}</span>
        <span className="text-slate-500 text-lg ml-2">Pricing & Devices</span>
      </h2>
      
      {/* Merchant Info Card */}
      {merchant && (
        <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border mb-6">
          <div className="bg-gradient-to-tl from-blue-600 to-violet-600 text-white p-4 rounded-t-2xl">
            <h3 className="text-lg font-bold mb-0 flex items-center">
              <i className="ni ni-single-02 mr-2"></i> Merchant Details
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="rounded-xl p-3 bg-gradient-to-tl from-gray-200 to-gray-100 mr-3">
                  <i className="ni ni-email-83 text-slate-700"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-semibold">{merchant.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="rounded-xl p-3 bg-gradient-to-tl from-gray-200 to-gray-100 mr-3">
                  <i className="ni ni-building text-slate-700"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Type</p>
                  <p className="text-sm font-semibold">{merchant.business_type}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="rounded-xl p-3 bg-gradient-to-tl from-gray-200 to-gray-100 mr-3">
                  <i className="ni ni-tag text-slate-700"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium shadow-sm ${
                    merchant.status === 'active' ? 'bg-gradient-to-tl from-emerald-500 to-teal-400 text-white' : 
                    merchant.status === 'suspended' ? 'bg-gradient-to-tl from-yellow-500 to-yellow-400 text-white' : 
                    'bg-gradient-to-tl from-red-500 to-red-400 text-white'
                  }`}>
                    {merchant.status ? merchant.status.charAt(0).toUpperCase() + merchant.status.slice(1) : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Alert */}
      {notification.message && (
        <div className={`flex items-center p-4 mb-6 rounded-lg shadow-sm ${getNotificationStyle(notification.type).bgClass}`} role="alert">
          <div className="mr-3">
            <i className={`${getNotificationStyle(notification.type).iconClass} text-white`}></i>
          </div>
          <div className="text-white font-medium">{notification.message}</div>
          <button 
            type="button" 
            className="ml-auto text-white opacity-70 hover:opacity-100" 
            onClick={() => setNotification({ type: '', message: '' })}
            aria-label="Close"
          >
            <i className="ni ni-fat-remove"></i>
          </button>
        </div>
      )}
      
      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="border-0 border-b-2 border-gray-100 mb-4">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
            <li className="mr-6" role="presentation">
              <button 
                className={`inline-flex items-center px-4 py-3 rounded-t-lg border-b-2 ${
                  activeTab === 'pricing' 
                    ? 'text-blue-600 border-blue-600 active font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('pricing')}
              >
                <i className="ni ni-money-coins mr-2 text-lg"></i> Pricing Plan
              </button>
            </li>
            <li className="mr-6" role="presentation">
              <button 
                className={`inline-flex items-center px-4 py-3 rounded-t-lg border-b-2 ${
                  activeTab === 'devices' 
                    ? 'text-blue-600 border-blue-600 active font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('devices')}
              >
                <i className="ni ni-laptop mr-2 text-lg"></i> 
                Device Management
                {assignedDevices.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-tl from-blue-500 to-violet-500 text-white">
                    {assignedDevices.length}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1">
          <div className="max-w-3xl mx-auto w-full mb-6">
            <div className="relative flex flex-col min-w-0 break-words bg-white mb-6 shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="p-6 pb-0 mb-0 bg-white rounded-t-2xl">
                <h6 className="mb-1 text-xl font-bold">Pricing Plan</h6>
              </div>
              <div className="flex-auto p-6">
                <form onSubmit={handlePricingSubmit}>
                  {/* MDR */}
                  <div className="mb-4">
                    <label htmlFor="mdr" className="block mb-2 text-xs font-bold text-slate-700">MDR (%)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01" 
                        className="focus:shadow-primary-outline text-sm leading-5.6 ease appearance-none block w-full h-10 rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none" 
                        id="mdr" 
                        value={pricing.mdr} 
                        onChange={(e) => setPricing({...pricing, mdr: e.target.value})}
                        placeholder="e.g., 2.5" 
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Merchant Discount Rate percentage</p>
                  </div>
                  
                  {/* Fixed Fee */}
                  <div className="mb-4">
                    <label htmlFor="fixedFee" className="block mb-2 text-xs font-bold text-slate-700">Fixed Transaction Fee</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">$</span>
                      </div>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="focus:shadow-primary-outline text-sm leading-5.6 ease appearance-none block w-full h-10 rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding pl-7 pr-12 px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none" 
                        id="fixedFee" 
                        value={pricing.fixedFee} 
                        onChange={(e) => setPricing({...pricing, fixedFee: e.target.value})}
                        placeholder="e.g., 0.30" 
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">AED</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Fixed amount charged per transaction</p>
                  </div>
                  
                  {/* Currencies */}
                  <div className="mb-4">
                    <label htmlFor="currencies" className="block mb-2 text-xs font-bold text-slate-700">Supported Currencies</label>
                    <select 
                      className="focus:shadow-primary-outline text-sm leading-5.6 ease appearance-none block w-full rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none" 
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
                    <p className="mt-1 text-xs text-slate-500">Hold Ctrl/Cmd to select multiple currencies</p>
                  </div>
                  
                  {/* Effective Date */}
                                    {/* Effective Date */}
                  <div className="mb-4">
                    <label htmlFor="effectiveDate" className="block mb-2 text-xs font-bold text-slate-700">Effective Start Date</label>
                    <DatePicker
                      selected={pricing.effectiveStartDate}
                      onChange={(date) => setPricing({...pricing, effectiveStartDate: date})}
                      className="focus:shadow-primary-outline text-sm leading-5.6 ease appearance-none block w-full h-10 rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                      id="effectiveDate"
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date()}
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500">When this pricing plan goes into effect</p>
                  </div>
                  
                  <div className="mt-5">
                    <button type="submit" className="inline-block px-8 py-2 w-full text-sm font-bold leading-normal text-center text-white capitalize bg-gradient-to-tl from-blue-500 to-violet-500 rounded-lg shadow-md hover:shadow-lg transition-all ease-in">
                      Save Pricing Plan
                    </button>
                  </div>
                  
                  <div className="mt-5">
                    <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
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
        <div className="flex flex-col">
          <div className="max-w-4xl mx-auto w-full mb-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white mb-6 shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="p-4 pb-0 mb-0 bg-white rounded-t-2xl flex justify-between items-center border-b border-gray-100">
                <h6 className="mb-2 text-xl font-bold">Device Management</h6>
                <button
                  className="inline-block px-4 py-2 mb-0 text-xs font-bold text-center uppercase align-middle transition-all bg-transparent border border-blue-500 rounded-lg shadow-none cursor-pointer leading-pro ease-soft-in hover:shadow-soft-md hover:bg-blue-50 active:opacity-85 tracking-tight-soft text-blue-500"
                  onClick={() => setShowBulkAssign(!showBulkAssign)}
                >
                  {showBulkAssign ? 'Hide Assignment' : 'Assign Devices'}
                </button>
              </div>
              <div className="flex-auto p-4">
                {/* Bulk Assign Devices Form */}
                {showBulkAssign && (
                  <div className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <h4 className="text-base font-bold mb-3">Assign Devices</h4>
                    
                    {/* SoftPOS ID manual entry */}
                    <div className="mb-4">
                      <label htmlFor="softPosId" className="block mb-2 text-xs font-bold text-slate-700">SoftPOS ID (Manual Entry)</label>
                      <input
                        type="text"
                        className="focus:shadow-primary-outline text-sm leading-5.6 ease appearance-none block w-full h-10 rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                        id="softPosId"
                        value={softPosId}
                        onChange={(e) => setSoftPosId(e.target.value)}
                        placeholder="Enter SoftPOS ID"
                      />
                      <p className="mt-1 text-xs text-slate-500">Manually enter a SoftPOS ID to assign</p>
                    </div>
                    
                    {/* Available POS Terminals */}
                    <div className="mb-4">
                      <label className="block mb-2 text-xs font-bold text-slate-700">Available POS Terminals</label>
                      {availableDevices.length === 0 ? (
                        <div className="rounded-lg bg-blue-50/50 p-3">
                          <div className="text-sm text-blue-700">
                            No available terminals found
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-auto rounded-lg border border-gray-100" style={{maxHeight: '200px', overflowY: 'auto'}}>
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="w-10 px-3 py-2"></th>
                                <th className="px-3 py-2 text-left text-xxs font-bold text-slate-500 uppercase tracking-wider">Serial</th>
                                <th className="px-3 py-2 text-left text-xxs font-bold text-slate-500 uppercase tracking-wider">Model</th>
                                <th className="px-3 py-2 text-left text-xxs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {availableDevices.map(device => (
                                <tr key={device.id || device._id} 
                                    className={selectedDevices.includes(device.id || device._id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                                    onClick={() => handleDeviceSelection(device.id || device._id)}>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center">
                                      <input
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        type="checkbox"
                                        id={`device-${device.id || device._id}`}
                                        checked={selectedDevices.includes(device.id || device._id)}
                                        onChange={() => handleDeviceSelection(device.id || device._id)}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">{device.serial || '—'}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">{device.model || 'Unknown'}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-lg ${
                                      device.status === 'active' ? 'bg-gradient-to-tl from-green-500 to-teal-400 text-white' : 
                                      device.status === 'pending' ? 'bg-gradient-to-tl from-yellow-400 to-orange-500 text-white' : 
                                      'bg-gray-100 text-gray-800'}`}>
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
                      <p className="mt-1 text-xs text-slate-500">Select multiple devices using checkboxes</p>
                    </div>
                    
                    <div className="mt-4">
                      <button 
                        className="inline-block px-8 py-2 w-full text-sm font-bold leading-normal text-center text-white capitalize bg-gradient-to-tl from-blue-500 to-violet-500 rounded-lg shadow-md hover:shadow-lg transition-all ease-in disabled:opacity-50"
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
                    <h4 className="text-base font-bold mb-3">Quick Assign Device</h4>
                    <div className="mb-3">
                      <select 
                        className="focus:shadow-primary-outline text-sm leading-5.6 ease appearance-none block w-full rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
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
                    <p className="mt-1 text-xs text-slate-500">Click "Assign Devices" for multi-select options</p>
                  </div>
                )}
                
                {/* Assigned Devices List */}
                <div className="mt-6">
                  <h4 className="text-base font-bold mb-3 flex items-center">
                    Assigned Devices
                    {assignedDevices.length > 0 && 
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-tl from-blue-500 to-violet-500 text-white">{assignedDevices.length}</span>
                    }
                  </h4>
                  {assignedDevices.length === 0 ? (
                    <div className="rounded-lg bg-blue-50/50 p-4">
                      <div className="text-sm text-blue-700">
                        No devices assigned to this merchant yet.
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-soft-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xxs font-bold text-slate-500 uppercase tracking-wider">Serial/ID</th>
                            <th scope="col" className="px-4 py-3 text-left text-xxs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-4 py-3 text-left text-xxs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-4 py-3 text-left text-xxs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {assignedDevices.map(device => (
                            <tr key={device.id || device._id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                                {device.serial || device.id || device._id}
                                {device.deviceType === 'softpos' && 
                                  <span className="ml-2 px-2 py-0.5 rounded-lg text-xs font-medium bg-gradient-to-tl from-cyan-400 to-blue-500 text-white">SoftPOS</span>
                                }
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{device.model || (device.deviceType === 'softpos' ? 'SoftPOS' : '—')}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-lg ${
                                  device.status === 'active' ? 'bg-gradient-to-tl from-green-500 to-teal-400 text-white' : 
                                  device.status === 'pending' ? 'bg-gradient-to-tl from-yellow-400 to-orange-500 text-white' : 
                                  'bg-gray-100 text-gray-800'}`}>
                                  {device.status ? 
                                    device.status.charAt(0).toUpperCase() + device.status.slice(1) : 
                                    'Unknown'}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <button 
                                  className="inline-block px-3 py-1 text-xs font-bold leading-normal text-center text-red-500 align-middle transition-all bg-transparent border border-red-500 rounded-lg shadow-none cursor-pointer hover:bg-red-50 hover:text-red-600 hover:shadow-soft-xs active:opacity-85 tracking-tight-soft"
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
