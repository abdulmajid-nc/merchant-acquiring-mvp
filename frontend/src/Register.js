import React, { useState } from 'react';
import { api, API_ENDPOINTS } from './utils/api';



export default function Register() {
  const [form, setForm] = useState({
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
    acquiring: {
      payment_methods: [],
      terminal_types: [],
      service_level: 'standard',
      pricing_model: 'flat_rate',
      settlement_currency: '',
      settlement_frequency: 'daily',
      requires_3ds: true,
      high_risk: false
    },
    bank_details: {
      account_name: '',
      account_number: '',
      bank_name: '',
      bank_code: '',
      swift_bic: '',
      iban: ''
    },
    docs: [],
    compliance_level: 'pending',
    kyc_verified: false,
    risk_assessment: {
      level: 'medium',
      notes: ''
    },
    locations: [],
    tier: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle changes for nested fields and arrays
  const handleChange = e => {
    const { name, value, type, checked, multiple, options } = e.target;
    // Handle multi-select
    if (multiple) {
      const values = Array.from(options).filter(o => o.selected).map(o => o.value);
      setForm(prev => ({ ...prev, [name]: values }));
      return;
    }
    // Handle nested fields (dot notation)
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      if (type === 'checkbox') {
        setForm(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [field]: checked
          }
        }));
      } else {
        setForm(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        }));
      }
      return;
    }
    // Handle checkboxes for arrays
    if (type === 'checkbox' && name.endsWith('[]')) {
      const field = name.replace('[]', '');
      setForm(prev => {
        const arr = prev[field] || [];
        return {
          ...prev,
          [field]: checked ? [...arr, value] : arr.filter(v => v !== value)
        };
      });
      return;
    }
    // Handle normal fields
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.post(API_ENDPOINTS.MERCHANT_REGISTER, form);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Merchant Registration</h1>
          <p className="text-gray-500">Register a new merchant in the Nymcard Acquire payment platform</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
          <form onSubmit={submit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Enter legal business name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Enter business email" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Enter business phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input name="website" value={form.website} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="https://example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <input name="business_type" value={form.business_type} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g. retail, restaurant" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input name="registration_number" value={form.registration_number} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Enter registration/license number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                <input name="tax_id" value={form.tax_id} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Enter tax identification number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incorporation Date</label>
                <input name="incorporation_date" type="date" value={form.incorporation_date} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
            </div>
            {/* Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                <textarea name="business_description" value={form.business_description} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" rows={2} placeholder="Describe your business" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MCC Code</label>
                <input name="mcc_code" value={form.mcc_code} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g. 5411" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Transaction Value</label>
                <input name="average_transaction_value" type="number" value={form.average_transaction_value} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g. 75" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Monthly Volume</label>
                <input name="estimated_monthly_volume" type="number" value={form.estimated_monthly_volume} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g. 10000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operating Countries</label>
                <select name="operating_countries" multiple value={form.operating_countries} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="EU">European Union</option>
                  <option value="AU">Australia</option>
                  <option value="GLOBAL">Global</option>
                </select>
              </div>
            </div>
            {/* Acquiring Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Acquiring Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Methods</label>
                  <div className="flex flex-wrap gap-2">
                    {['visa','mastercard','amex','discover','unionpay'].map(method => (
                      <label key={method} className="inline-flex items-center">
                        <input type="checkbox" name="acquiring.payment_methods" value={method} checked={form.acquiring.payment_methods.includes(method)} onChange={e => {
                          const checked = e.target.checked;
                          setForm(prev => ({
                            ...prev,
                            acquiring: {
                              ...prev.acquiring,
                              payment_methods: checked
                                ? [...prev.acquiring.payment_methods, method]
                                : prev.acquiring.payment_methods.filter(m => m !== method)
                            }
                          }));
                        }} className="mr-1" />
                        <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terminal Types</label>
                  <div className="flex flex-wrap gap-2">
                    {['physical','virtual','mobile','ecommerce'].map(type => (
                      <label key={type} className="inline-flex items-center">
                        <input type="checkbox" name="acquiring.terminal_types" value={type} checked={form.acquiring.terminal_types.includes(type)} onChange={e => {
                          const checked = e.target.checked;
                          setForm(prev => ({
                            ...prev,
                            acquiring: {
                              ...prev.acquiring,
                              terminal_types: checked
                                ? [...prev.acquiring.terminal_types, type]
                                : prev.acquiring.terminal_types.filter(t => t !== type)
                            }
                          }));
                        }} className="mr-1" />
                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Level</label>
                  <select name="acquiring.service_level" value={form.acquiring.service_level} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model</label>
                  <select name="acquiring.pricing_model" value={form.acquiring.pricing_model} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    <option value="flat_rate">Flat Rate</option>
                    <option value="interchange_plus">Interchange Plus</option>
                    <option value="tiered">Tiered</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Currency</label>
                  <input name="acquiring.settlement_currency" value={form.acquiring.settlement_currency} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g. USD" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Frequency</label>
                  <select name="acquiring.settlement_frequency" value={form.acquiring.settlement_frequency} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="acquiring.requires_3ds" checked={form.acquiring.requires_3ds} onChange={handleChange} className="mr-2" />
                  <label className="text-sm font-medium text-gray-700">Enable 3D Secure</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="acquiring.high_risk" checked={form.acquiring.high_risk} onChange={handleChange} className="mr-2" />
                  <label className="text-sm font-medium text-gray-700">High Risk Merchant</label>
                </div>
              </div>
            </div>
            {/* Banking Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Banking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input name="bank_details.account_name" value={form.bank_details.account_name} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Account holder name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input name="bank_details.account_number" value={form.bank_details.account_number} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Account number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input name="bank_details.bank_name" value={form.bank_details.bank_name} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Bank name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Code</label>
                  <input name="bank_details.bank_code" value={form.bank_details.bank_code} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Bank code or routing number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT/BIC</label>
                  <input name="bank_details.swift_bic" value={form.bank_details.swift_bic} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="SWIFT or BIC code" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                  <input name="bank_details.iban" value={form.bank_details.iban} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="IBAN" />
                </div>
              </div>
            </div>
            {/* Compliance Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Compliance & Risk</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Level</label>
                  <select name="compliance_level" value={form.compliance_level} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    <option value="pending">Pending</option>
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="full">Full</option>
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <input type="checkbox" name="kyc_verified" checked={form.kyc_verified} onChange={handleChange} className="mr-2" />
                  <label className="text-sm font-medium text-gray-700">KYC Verified</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                  <select name="risk_assessment.level" value={form.risk_assessment.level} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Notes</label>
                  <input name="risk_assessment.notes" value={form.risk_assessment.notes} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Risk notes" />
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          {error && <div className="mt-4 text-red-600">{error}</div>}
          {result && !error && (
            <div className="mt-4 text-green-600">
              {result.success || result.id ? 'Registration successful!' : 'Registration submitted!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}