import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { API_ENDPOINTS } from './utils/api';

export default function Register() {
  const [activeTab, setActiveTab] = useState('basic');
  const [form, setForm] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    website: '',
    business_type: '',
    registration_number: '',
    tax_id: '',
    incorporation_date: '',
    business_description: '',
    mcc_code: '',
    average_transaction_value: '',
    estimated_monthly_volume: '',
    operating_countries: [],
    
    // Acquiring Business
    acquiring: {
      payment_methods: [],
      terminal_types: [],
      service_level: 'standard',
      pricing_model: 'flat_rate',
      settlement_currency: 'USD',
      settlement_frequency: 'daily',
      requires_3ds: true,
      high_risk: false
    },
    
    // Banking Information
    bank_details: {
      account_name: '',
      account_number: '',
      bank_name: '',
      bank_code: '',
      swift_bic: '',
      iban: ''
    }
  });
  
  const [result, setResult] = useState(null);
  const [debug, setDebug] = useState({});

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      if (section === 'bank_details') {
        setForm({
          ...form,
          [section]: {
            ...form[section],
            [field]: value
          }
        });
      } else {
        setForm({
          ...form,
          [section]: {
            ...form[section],
            [field]: type === 'checkbox' ? checked : value
          }
        });
      }
    } else if (type === 'checkbox' && name.endsWith('[]')) {
      // Handle multi-select checkboxes
      const fieldName = name.slice(0, -2);
      let values = Array.isArray(form[fieldName]) ? [...form[fieldName]] : [];
      
      if (checked) {
        values.push(value);
      } else {
        values = values.filter(item => item !== value);
      }
      
      setForm({ ...form, [fieldName]: values });
    } else if (name.endsWith('[]')) {
      // Handle multi-select for acquiring and issuing fields
      const fieldName = name.slice(0, -2);
      const [section, field] = fieldName.split('.');
      
      let values = Array.isArray(form[section][field]) ? [...form[section][field]] : [];
      
      if (type === 'checkbox') {
        if (checked) {
          values.push(value);
        } else {
          values = values.filter(item => item !== value);
        }
      } else {
        // For multi-select elements
        values = Array.isArray(value) ? value : [value];
      }
      
      setForm({
        ...form,
        [section]: {
          ...form[section],
          [field]: values
        }
      });
    } else {
      // Handle regular fields
      setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const submit = async e => {
    e.preventDefault();
    setResult(null);
    setDebug({ request: form });
    try {
      const data = await api.post(API_ENDPOINTS.MERCHANT_REGISTER, form);
      setDebug(prev => ({ ...prev, responseStatus: 200, responseData: data }));
      setResult(data);
    } catch (err) {
      setDebug(prev => ({ ...prev, fetchError: err.message || String(err) }));
      setResult({ error: err.message || 'Registration failed' });
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Merchant Registration</h1>
          <p className="text-gray-500">Register a new merchant in the Nymcard Acquire payment platform</p>
        </div>
      </div>
      
      <div className="flex flex-wrap">
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <ul className="nav nav-tabs mb-4" id="registrationTabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('basic')}
                  >
                    Basic Information
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'acquiring' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('acquiring')}
                  >
                    Acquiring Configuration
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'banking' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('banking')}
                  >
                    Banking Details
                  </button>
                </li>
              </ul>
              
              <form onSubmit={submit}>
                {/* Basic Information Tab */}
                <div className={`${activeTab === 'basic' ? 'block' : 'hidden'}`}>
                  <h5 className="font-bold mb-4">Business Information</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                      <input 
                        id="name"
                        name="name" 
                        value={form.name}
                        onChange={handleChange} 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                        placeholder="Enter legal business name" 
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                      <select 
                        id="business_type"
                        name="business_type" 
                        value={form.business_type}
                        onChange={handleChange} 
                        className="form-select"
                        required
                      >
                        <option value="">Select business type</option>
                        <option value="retail">Retail</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="saas">SaaS / Technology</option>
                        <option value="financial_services">Financial Services</option>
                        <option value="travel">Travel & Hospitality</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="professional_services">Professional Services</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">Business Email</label>
                      <input 
                        id="email"
                        name="email" 
                        type="email"
                        value={form.email}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="Enter business email" 
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="phone" className="form-label">Business Phone</label>
                      <input 
                        id="phone"
                        name="phone" 
                        type="tel"
                        value={form.phone}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="Enter business phone number" 
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="website" className="form-label">Business Website</label>
                      <input 
                        id="website"
                        name="website" 
                        type="url"
                        value={form.website}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="https://example.com" 
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="mcc_code" className="form-label">MCC Code</label>
                      <input 
                        id="mcc_code"
                        name="mcc_code" 
                        value={form.mcc_code}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="e.g., 5411 for Grocery Stores" 
                      />
                      <div className="form-text">Merchant Category Code - defines your business type for card networks</div>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="registration_number" className="form-label">Business Registration Number</label>
                      <input 
                        id="registration_number"
                        name="registration_number" 
                        value={form.registration_number}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="Enter registration/license number" 
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="tax_id" className="form-label">Tax ID / VAT Number</label>
                      <input 
                        id="tax_id"
                        name="tax_id" 
                        value={form.tax_id}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="Enter tax identification number" 
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="incorporation_date" className="form-label">Incorporation Date</label>
                      <input 
                        id="incorporation_date"
                        name="incorporation_date" 
                        type="date"
                        value={form.incorporation_date}
                        onChange={handleChange} 
                        className="form-control" 
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="operating_countries" className="form-label">Operating Countries</label>
                      <select
                        id="operating_countries"
                        name="operating_countries[]"
                        multiple
                        className="form-select"
                        onChange={handleChange}
                        value={form.operating_countries}
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="EU">European Union</option>
                        <option value="AU">Australia</option>
                        <option value="GLOBAL">Global / Multiple Regions</option>
                      </select>
                      <div className="form-text">Hold Ctrl/Cmd to select multiple countries</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="business_description" className="form-label">Business Description</label>
                    <textarea 
                      id="business_description"
                      name="business_description" 
                      value={form.business_description}
                      onChange={handleChange} 
                      className="form-control" 
                      rows="3"
                      placeholder="Describe your business activities, products or services offered" 
                    ></textarea>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label htmlFor="average_transaction_value" className="form-label">Average Transaction Value ($)</label>
                      <input 
                        id="average_transaction_value"
                        name="average_transaction_value" 
                        type="number"
                        value={form.average_transaction_value}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="e.g., 75" 
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="estimated_monthly_volume" className="form-label">Estimated Monthly Volume ($)</label>
                      <input 
                        id="estimated_monthly_volume"
                        name="estimated_monthly_volume" 
                        type="number"
                        value={form.estimated_monthly_volume}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="e.g., 10000" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Acquiring Business Tab */}
                <div className={`tab-pane ${activeTab === 'acquiring' ? 'd-block' : 'd-none'}`}>
                  <h5 className="fw-bold mb-4">Acquiring Business Configuration</h5>
                  
                  <div className="mb-4">
                    <label className="form-label d-block">Payment Methods Accepted</label>
                    <div className="form-check form-check-inline">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="visa"
                        name="acquiring.payment_methods[]" 
                        value="visa"
                        checked={form.acquiring.payment_methods.includes('visa')}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="visa">Visa</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="mastercard"
                        name="acquiring.payment_methods[]" 
                        value="mastercard"
                        checked={form.acquiring.payment_methods.includes('mastercard')}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="mastercard">Mastercard</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="amex"
                        name="acquiring.payment_methods[]" 
                        value="amex"
                        checked={form.acquiring.payment_methods.includes('amex')}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="amex">American Express</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="discover"
                        name="acquiring.payment_methods[]" 
                        value="discover"
                        checked={form.acquiring.payment_methods.includes('discover')}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="discover">Discover</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="unionpay"
                        name="acquiring.payment_methods[]" 
                        value="unionpay"
                        checked={form.acquiring.payment_methods.includes('unionpay')}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="unionpay">UnionPay</label>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label d-block">Terminal Types</label>
                    <div className="form-check form-check-inline">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="physical"
                        name="acquiring.terminal_types[]" 
                        value="physical"
                        checked={form.acquiring.terminal_types.includes('physical')}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="physical">Physical POS</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="virtual"
                        name="acquiring.terminal_types[]" 
                        value="virtual"
                        checked={form.acquiring.terminal_types.includes('virtual')}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="virtual">Virtual Terminal</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="mobile"
                        name="acquiring.terminal_types[]" 
                        value="mobile"
                        checked={form.acquiring.terminal_types.includes('mobile')}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="mobile">Mobile POS</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="ecommerce"
                        name="acquiring.terminal_types[]" 
                        value="ecommerce"
                        checked={form.acquiring.terminal_types.includes('ecommerce')}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="ecommerce">E-commerce Gateway</label>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="service_level" className="form-label">Service Level</label>
                      <select 
                        id="service_level"
                        name="acquiring.service_level" 
                        value={form.acquiring.service_level}
                        onChange={handleChange} 
                        className="form-select"
                      >
                        <option value="standard">Standard (24/7 email support)</option>
                        <option value="premium">Premium (24/7 phone + email, dedicated rep)</option>
                        <option value="enterprise">Enterprise (Custom SLA, dedicated team)</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="pricing_model" className="form-label">Pricing Model</label>
                      <select 
                        id="pricing_model"
                        name="acquiring.pricing_model" 
                        value={form.acquiring.pricing_model}
                        onChange={handleChange} 
                        className="form-select"
                      >
                        <option value="flat_rate">Flat Rate</option>
                        <option value="interchange_plus">Interchange Plus</option>
                        <option value="tiered">Tiered Pricing</option>
                        <option value="custom">Custom Pricing</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="settlement_currency" className="form-label">Settlement Currency</label>
                      <select 
                        id="settlement_currency"
                        name="acquiring.settlement_currency" 
                        value={form.acquiring.settlement_currency}
                        onChange={handleChange} 
                        className="form-select"
                      >
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="GBP">British Pound (GBP)</option>
                        <option value="CAD">Canadian Dollar (CAD)</option>
                        <option value="AUD">Australian Dollar (AUD)</option>
                        <option value="JPY">Japanese Yen (JPY)</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="settlement_frequency" className="form-label">Settlement Frequency</label>
                      <select 
                        id="settlement_frequency"
                        name="acquiring.settlement_frequency" 
                        value={form.acquiring.settlement_frequency}
                        onChange={handleChange} 
                        className="form-select"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input 
                          type="checkbox" 
                          className="form-check-input" 
                          id="requires_3ds"
                          name="acquiring.requires_3ds" 
                          checked={form.acquiring.requires_3ds}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="requires_3ds">Enable 3D Secure Authentication</label>
                      </div>
                      <div className="form-text">Enhanced security for online transactions</div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input 
                          type="checkbox" 
                          className="form-check-input" 
                          id="high_risk"
                          name="acquiring.high_risk" 
                          checked={form.acquiring.high_risk}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="high_risk">High-Risk Merchant</label>
                      </div>
                      <div className="form-text">For businesses in high-risk industries or with high chargeback rates</div>
                    </div>
                  </div>
                </div>
                

                
                {/* Banking Details Tab */}
                <div className={`tab-pane ${activeTab === 'banking' ? 'd-block' : 'd-none'}`}>
                  <h5 className="fw-bold mb-4">Banking & Settlement Details</h5>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="account_name" className="form-label">Account Holder Name</label>
                      <input 
                        id="account_name"
                        name="bank_details.account_name" 
                        value={form.bank_details.account_name}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="Enter account holder name" 
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="bank_name" className="form-label">Bank Name</label>
                      <input 
                        id="bank_name"
                        name="bank_details.bank_name" 
                        value={form.bank_details.bank_name}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="Enter bank name" 
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="account_number" className="form-label">Account Number</label>
                      <input 
                        id="account_number"
                        name="bank_details.account_number" 
                        value={form.bank_details.account_number}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="Enter account number" 
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="bank_code" className="form-label">Bank Code / Routing Number</label>
                      <input 
                        id="bank_code"
                        name="bank_details.bank_code" 
                        value={form.bank_details.bank_code}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="Enter bank code or routing number" 
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label htmlFor="swift_bic" className="form-label">SWIFT/BIC Code</label>
                      <input 
                        id="swift_bic"
                        name="bank_details.swift_bic" 
                        value={form.bank_details.swift_bic}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="Enter SWIFT or BIC code" 
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="iban" className="form-label">IBAN (International Bank Account Number)</label>
                      <input 
                        id="iban"
                        name="bank_details.iban" 
                        value={form.bank_details.iban}
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder="Enter IBAN if applicable" 
                      />
                    </div>
                  </div>
                </div>
                
                <hr className="my-4" />
                
                <div className="d-flex justify-content-between">
                  {activeTab !== 'basic' && (
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => {
                        const tabs = ['basic', 'acquiring', 'banking'];
                        const currentIndex = tabs.indexOf(activeTab);
                        setActiveTab(tabs[currentIndex - 1]);
                      }}
                    >
                      Previous
                    </button>
                  )}
                  
                  {activeTab !== 'banking' ? (
                    <button 
                      type="button" 
                      className="btn btn-primary ms-auto" 
                      onClick={() => {
                        const tabs = ['basic', 'acquiring', 'banking'];
                        const currentIndex = tabs.indexOf(activeTab);
                        setActiveTab(tabs[currentIndex + 1]);
                      }}
                    >
                      Next
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-success ms-auto">
                      Submit Application
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mt-4 mt-lg-0">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Application Status</h5>
              {!result && (
                <div className="text-center py-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#6c757d" className="mb-3" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                  <p className="text-muted mb-0">Submit your application to see status information</p>
                </div>
              )}
              
              {result && result.error && (
                <div className="alert alert-danger">
                  <h6 className="alert-heading fw-bold">Registration Failed</h6>
                  <p className="mb-0">{result.error}</p>
                </div>
              )}
              
              {result && result.id && (
                <div className="alert alert-success">
                  <h6 className="alert-heading fw-bold">Registration Successful!</h6>
                  <p>Your merchant application has been submitted successfully.</p>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span>Merchant ID:</span>
                    <strong>{result.id}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Status:</span>
                    <span className="badge bg-warning text-dark">{result.status || 'Pending'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="card border-0 bg-light">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Next Steps</h5>
              <ol className="ps-3">
                <li className="mb-2">Complete the registration form with accurate business information</li>
                <li className="mb-2">Submit your application for review</li>
                <li className="mb-2">Our team will verify your details (typically 1-2 business days)</li>
                <li className="mb-2">Upon approval, you'll receive credentials to access the merchant portal</li>
                <li>Set up your payment terminals and start accepting payments</li>
              </ol>
              <div className="mt-3">
                <Link to="/status" className="text-decoration-none">Check existing application status →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug info - hidden in production */}
      {process.env.NODE_ENV === 'development' && (debug.request || debug.responseStatus || debug.responseData || debug.fetchError) && (
        <div className="card mt-4 border-0">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Debug Information</h5>
            <div className="small">
              {debug.request && (
                <div className="mb-3">
                  <h6 className="text-muted">Request Payload:</h6>
                  <pre className="bg-light p-3 rounded">{JSON.stringify(debug.request, null, 2)}</pre>
                </div>
              )}
              
              {debug.responseStatus && (
                <div className="mb-3">
                  <h6 className="text-muted">Response Status:</h6>
                  <div className="bg-light p-3 rounded">{debug.responseStatus}</div>
                </div>
              )}
              
              {debug.responseData && (
                <div className="mb-3">
                  <h6 className="text-muted">Response Data:</h6>
                  <pre className="bg-light p-3 rounded">{JSON.stringify(debug.responseData, null, 2)}</pre>
                </div>
              )}
              
              {debug.fetchError && (
                <div className="mb-3">
                  <h6 className="text-muted">Fetch Error:</h6>
                  <div className="bg-light p-3 rounded text-danger">{debug.fetchError}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
