import React, { useState, useEffect } from 'react';
import { financialAPI, logActivity } from '../services/api';

const FinancialManagement = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [summary, setSummary] = useState({
    year: new Date().getFullYear(),
    total_income: 0,
    total_expense: 0,
    net_balance: 0,
    monthly_data: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  const fetchFinancialSummary = async () => {
    try {
      const response = await financialAPI.getFinancialSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
        <p className="text-gray-600 mt-1">Track barangay income, expenses, and generate reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-3xl font-bold text-green-600">₱{summary.total_income.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600">₱{summary.total_expense.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-red-600 rounded"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p className={`text-3xl font-bold ${summary.net_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₱{summary.net_balance.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 ${summary.net_balance >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
              <div className={`w-6 h-6 ${summary.net_balance >= 0 ? 'bg-green-600' : 'bg-red-600'} rounded`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('income')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'income'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 ${activeTab === 'income' ? 'bg-blue-600' : 'bg-gray-400'} rounded-full`}></div>
                <span>Income Records</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'expense'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className={`w-4 h-4 ${activeTab === 'expense' ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Expense Records</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'reports'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className={`w-4 h-4 ${activeTab === 'reports' ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Financial Reports</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transparency')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'transparency'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className={`w-4 h-4 ${activeTab === 'transparency' ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Transparency Board</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'income' && <IncomeManagement />}
          {activeTab === 'expense' && <ExpenseManagement />}
          {activeTab === 'reports' && <FinancialReports />}
          {activeTab === 'transparency' && <TransparencyBoard />}
        </div>
      </div>
    </div>
  );
};

const IncomeManagement = () => {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [formData, setFormData] = useState({
    category: '',
    income_type: '',
    description: '',
    amount: '',
    source: '',
    reference_number: '',
    date_received: ''
  });

  const filteredIncomes = incomes.filter(income =>
    income.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.income_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIncomes = filteredIncomes.slice(startIndex, endIndex);

  const getTypeOptions = (categoryId) => {
    if (!categoryId) return [];
    
    const category = categories.find(cat => cat.id == categoryId);
    if (!category) return [];
    
    const typeOptions = {
      'Certificate Fees': [
        { value: 'barangay_clearance', label: 'Barangay Clearance' },
        { value: 'indigency', label: 'Certificate of Indigency' },
        { value: 'residency', label: 'Certificate of Residency' },
        { value: 'good_moral', label: 'Good Moral Character' },
        { value: 'other_cert', label: 'Other Certificate' }
      ],
      'Permit Fees': [
        { value: 'business_permit', label: 'Business Permit' },
        { value: 'construction_permit', label: 'Construction Permit' },
        { value: 'event_permit', label: 'Event Permit' },
        { value: 'other_permit', label: 'Other Permit' }
      ],
      'Donations': [
        { value: 'community_donation', label: 'Community Donation' },
        { value: 'religious_donation', label: 'Religious Donation' },
        { value: 'charity_donation', label: 'Charity Donation' },
        { value: 'other_donation', label: 'Other Donation' }
      ],
      'Government Grants': [
        { value: 'infrastructure_grant', label: 'Infrastructure Grant' },
        { value: 'health_grant', label: 'Health Program Grant' },
        { value: 'education_grant', label: 'Education Grant' },
        { value: 'other_grant', label: 'Other Grant' }
      ],
      'Other Income': [
        { value: 'rental_income', label: 'Rental Income' },
        { value: 'interest_income', label: 'Interest Income' },
        { value: 'miscellaneous', label: 'Miscellaneous' }
      ]
    };
    
    return typeOptions[category.name] || [];
  };

  useEffect(() => {
    fetchIncomes();
    fetchCategories();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await financialAPI.getIncomes();
      setIncomes(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await financialAPI.getIncomeCategories();
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData({
      ...formData,
      category: categoryId,
      income_type: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        category: parseInt(formData.category),
        amount: parseFloat(formData.amount)
      };
      await financialAPI.createIncome(submitData);
      setShowForm(false);
      setFormData({
        category: '',
        income_type: '',
        description: '',
        amount: '',
        source: '',
        reference_number: '',
        date_received: ''
      });
      fetchIncomes();
    } catch (error) {
      console.error('Error creating income:', error);
    }
  };

  const handleExportIncome = () => {
    const csvContent = [
      ['ID', 'Income Number', 'Category', 'Income Type', 'Description', 'Amount', 'Source', 'Reference Number', 'Date Received', 'Recorded By'],
      ...incomes.map(income => [
        income.id,
        income.income_number || '',
        income.category?.name || '',
        income.income_type,
        income.description,
        income.amount,
        income.source,
        income.reference_number || '',
        income.date_received,
        income.recorded_by?.first_name + ' ' + income.recorded_by?.last_name || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `income_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity('export', `Exported income records (${incomes.length} records)`, {
      record_count: incomes.length,
      export_type: 'income_records'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Income Records</h3>
        <div className="flex space-x-3">
          <button
            onClick={handleExportIncome}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Income
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search income records..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredIncomes.length)} of {filteredIncomes.length} records
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowForm(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Add New Income
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={formData.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories && categories.length > 0 ? categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            )) : (
                              <option value="" disabled>No categories available</option>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={formData.income_type}
                            onChange={(e) => setFormData({...formData, income_type: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!formData.category}
                          >
                            <option value="">
                              {formData.category ? 'Select Type' : 'Select Category First'}
                            </option>
                            {getTypeOptions(formData.category).map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                          <input
                            type="text"
                            value={formData.source}
                            onChange={(e) => setFormData({...formData, source: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
                          <input
                            type="date"
                            value={formData.date_received}
                            onChange={(e) => setFormData({...formData, date_received: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Income
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedIncomes && paginatedIncomes.length > 0 ? paginatedIncomes.map(income => (
              <tr key={income.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{income.income_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{income.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{parseFloat(income.amount).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{income.source}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(income.date_received).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No income records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [formData, setFormData] = useState({
    category: '',
    expense_type: '',
    description: '',
    amount: '',
    vendor: '',
    reference_number: '',
    date_paid: ''
  });

  const getTypeOptions = (categoryId) => {
    if (!categoryId) return [];
    
    const category = categories.find(cat => cat.id == categoryId);
    if (!category) return [];
    
    const typeOptions = {
      'Project Expenses': [
        { value: 'infrastructure', label: 'Infrastructure Project' },
        { value: 'renovation', label: 'Building Renovation' },
        { value: 'equipment', label: 'Equipment Purchase' },
        { value: 'other_project', label: 'Other Project' }
      ],
      'Allowances': [
        { value: 'official_allowance', label: 'Official Allowance' },
        { value: 'travel_allowance', label: 'Travel Allowance' },
        { value: 'meal_allowance', label: 'Meal Allowance' },
        { value: 'other_allowance', label: 'Other Allowance' }
      ],
      'Utilities': [
        { value: 'electricity', label: 'Electricity Bill' },
        { value: 'water', label: 'Water Bill' },
        { value: 'internet', label: 'Internet Bill' },
        { value: 'other_utility', label: 'Other Utility' }
      ],
      'Maintenance': [
        { value: 'building_maintenance', label: 'Building Maintenance' },
        { value: 'equipment_maintenance', label: 'Equipment Maintenance' },
        { value: 'vehicle_maintenance', label: 'Vehicle Maintenance' },
        { value: 'other_maintenance', label: 'Other Maintenance' }
      ],
      'Office Supplies': [
        { value: 'stationery', label: 'Stationery' },
        { value: 'printing', label: 'Printing Materials' },
        { value: 'cleaning', label: 'Cleaning Supplies' },
        { value: 'other_supplies', label: 'Other Supplies' }
      ],
      'Other Expenses': [
        { value: 'emergency', label: 'Emergency Expense' },
        { value: 'miscellaneous', label: 'Miscellaneous' }
      ]
    };
    
    return typeOptions[category.name] || [];
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const filteredExpenses = expenses.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  const fetchExpenses = async () => {
    try {
      const response = await financialAPI.getExpenses();
      setExpenses(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await financialAPI.getExpenseCategories();
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData({
      ...formData,
      category: categoryId,
      expense_type: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        category: parseInt(formData.category),
        amount: parseFloat(formData.amount)
      };
      await financialAPI.createExpense(submitData);
      setShowForm(false);
      setFormData({
        category: '',
        expense_type: '',
        description: '',
        amount: '',
        vendor: '',
        reference_number: '',
        date_paid: ''
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleExportExpense = () => {
    const csvContent = [
      ['ID', 'Expense Number', 'Category', 'Expense Type', 'Description', 'Amount', 'Vendor', 'Reference Number', 'Date Paid', 'Recorded By'],
      ...expenses.map(expense => [
        expense.id,
        expense.expense_number || '',
        expense.category?.name || '',
        expense.expense_type,
        expense.description,
        expense.amount,
        expense.vendor,
        expense.reference_number || '',
        expense.date_paid,
        expense.recorded_by?.first_name + ' ' + expense.recorded_by?.last_name || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expense_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity('export', `Exported expense records (${expenses.length} records)`, {
      record_count: expenses.length,
      export_type: 'expense_records'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Expense Records</h3>
        <div className="flex space-x-3">
          <button
            onClick={handleExportExpense}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Add Expense
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search expense records..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length} records
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowForm(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Add New Expense
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={formData.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories && categories.length > 0 ? categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            )) : (
                              <option value="" disabled>No categories available</option>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={formData.expense_type}
                            onChange={(e) => setFormData({...formData, expense_type: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                            disabled={!formData.category}
                          >
                            <option value="">
                              {formData.category ? 'Select Type' : 'Select Category First'}
                            </option>
                            {getTypeOptions(formData.category).map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                          rows="3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                          <input
                            type="text"
                            value={formData.vendor}
                            onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date Paid</label>
                          <input
                            type="date"
                            value={formData.date_paid}
                            onChange={(e) => setFormData({...formData, date_paid: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Expense
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedExpenses && paginatedExpenses.length > 0 ? paginatedExpenses.map(expense => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.expense_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{parseFloat(expense.amount).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.vendor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(expense.date_paid).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No expense records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? 'bg-red-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const FinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [generateForm, setGenerateForm] = useState({
    report_type: '',
    year: new Date().getFullYear(),
    month: '',
    quarter: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(report =>
    report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.report_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  const fetchReports = async () => {
    try {
      const response = await financialAPI.getFinancialReports();
      setReports(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      if (generateForm.report_type === 'monthly') {
        await financialAPI.generateMonthlyReport({
          year: generateForm.year,
          month: generateForm.month
        });
      } else if (generateForm.report_type === 'quarterly') {
        await financialAPI.generateQuarterlyReport({
          year: generateForm.year,
          quarter: generateForm.quarter
        });
      }
      setShowGenerateForm(false);
      setGenerateForm({
        report_type: '',
        year: new Date().getFullYear(),
        month: '',
        quarter: ''
      });
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
        <button
          onClick={() => setShowGenerateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Generate Report
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length} records
        </div>
      </div>

      {showGenerateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowGenerateForm(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Generate Financial Report
                    </h3>
                    <form onSubmit={handleGenerateReport} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <select
                          value={generateForm.report_type}
                          onChange={(e) => setGenerateForm({...generateForm, report_type: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        >
                          <option value="">Select Report Type</option>
                          <option value="monthly">Monthly Report</option>
                          <option value="quarterly">Quarterly Report</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                          value={generateForm.year}
                          onChange={(e) => setGenerateForm({...generateForm, year: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        >
                          {Array.from({length: 5}, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return <option key={year} value={year}>{year}</option>;
                          })}
                        </select>
                      </div>
                      {generateForm.report_type === 'monthly' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                          <select
                            value={generateForm.month}
                            onChange={(e) => setGenerateForm({...generateForm, month: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          >
                            <option value="">Select Month</option>
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                          </select>
                        </div>
                      )}
                      {generateForm.report_type === 'quarterly' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
                          <select
                            value={generateForm.quarter}
                            onChange={(e) => setGenerateForm({...generateForm, quarter: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          >
                            <option value="">Select Quarter</option>
                            <option value="1">Q1 (Jan-Mar)</option>
                            <option value="2">Q2 (Apr-Jun)</option>
                            <option value="3">Q3 (Jul-Sep)</option>
                            <option value="4">Q4 (Oct-Dec)</option>
                          </select>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleGenerateReport}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Generate Report
                </button>
                <button
                  onClick={() => setShowGenerateForm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Income</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Expense</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedReports && paginatedReports.length > 0 ? paginatedReports.map(report => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.report_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{report.report_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{parseFloat(report.total_income).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{parseFloat(report.total_expense).toLocaleString()}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${report.net_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₱{parseFloat(report.net_balance).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    report.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">No financial reports found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? 'bg-green-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const TransparencyBoard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_published: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const fetchPosts = async () => {
    try {
      const response = await financialAPI.getTransparencyBoards();
      setPosts(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await financialAPI.createTransparencyBoard(formData);
      setShowForm(false);
      setFormData({
        title: '',
        content: '',
        is_published: false
      });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const togglePublish = async (postId, currentStatus) => {
    try {
      await financialAPI.updateTransparencyBoard(postId, {
        is_published: !currentStatus
      });
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Transparency Board</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add Post
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} records
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowForm(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Add Transparency Post
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData({...formData, content: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows="6"
                          required
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_published"
                          checked={formData.is_published}
                          onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                          Publish immediately
                        </label>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Post
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {paginatedPosts && paginatedPosts.length > 0 ? paginatedPosts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  post.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.is_published ? 'Published' : 'Draft'}
                </span>
                <button
                  onClick={() => togglePublish(post.id, post.is_published)}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    post.is_published 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {post.is_published ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</div>
            <div className="text-sm text-gray-500">
              Created: {new Date(post.created_at).toLocaleDateString()}
              {post.published_at && (
                <span className="ml-4">
                  Published: {new Date(post.published_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transparency posts found</p>
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;
