import React, { useState, useEffect } from 'react';
import { householdsAPI, puroksAPI } from '../services/api';

const HouseholdsManagement = () => {
  const [households, setHouseholds] = useState([]);
  const [puroks, setPuroks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurok, setFilterPurok] = useState('');
  const [formData, setFormData] = useState({
    purok: '',
    address: '',
    contact_number: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [householdsRes, puroksRes] = await Promise.all([
        householdsAPI.getHouseholds(),
        puroksAPI.getPuroks(),
      ]);
      setHouseholds(householdsRes.data.results || householdsRes.data);
      setPuroks(puroksRes.data.results || puroksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHousehold) {
        await householdsAPI.updateHousehold(editingHousehold.id, formData);
      } else {
        await householdsAPI.createHousehold(formData);
      }
      await fetchData();
      setShowForm(false);
      setEditingHousehold(null);
      resetForm();
    } catch (error) {
      console.error('Error saving household:', error);
    }
  };

  const handleEdit = (household) => {
    setEditingHousehold(household);
    setFormData({
      purok: household.purok,
      address: household.address,
      contact_number: household.contact_number || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this household?')) {
      try {
        await householdsAPI.deleteHousehold(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting household:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      purok: '',
      address: '',
      contact_number: '',
    });
  };

  const filteredHouseholds = households.filter(household => {
    const matchesSearch = household.household_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         household.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPurok = !filterPurok || household.purok === parseInt(filterPurok);
    return matchesSearch && matchesPurok;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Households Management</h1>
          <p className="text-gray-600 mt-1">Manage household information and family groupings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
        >
          Add New Household
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Search Households</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by household number or address..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Purok</label>
            <select
              value={filterPurok}
              onChange={(e) => setFilterPurok(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Puroks</option>
              {puroks.map(purok => (
                <option key={purok.id} value={purok.id}>{purok.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="bg-blue-50 rounded-lg p-4 w-full">
              <div className="text-sm font-medium text-blue-800">Total Households</div>
              <div className="text-2xl font-bold text-blue-900">{households.length}</div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Household Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purok</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHouseholds.map((household) => (
                <tr key={household.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{household.household_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {household.purok_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{household.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {household.contact_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(household)}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(household.id)}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-2xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingHousehold ? 'Edit Household' : 'Add New Household'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingHousehold(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Purok</label>
                  <select
                    value={formData.purok}
                    onChange={(e) => setFormData({...formData, purok: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select Purok</option>
                    {puroks.map(purok => (
                      <option key={purok.id} value={purok.id}>{purok.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                    placeholder="09XXXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingHousehold(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
                  >
                    {editingHousehold ? 'Update Household' : 'Create Household'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseholdsManagement;
