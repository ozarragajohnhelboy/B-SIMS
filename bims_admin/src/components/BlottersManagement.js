import React, { useState, useEffect } from 'react';
import { blottersAPI } from '../services/api';

const BlottersManagement = () => {
  const [blotters, setBlotters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlotter, setEditingBlotter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [formData, setFormData] = useState({
    complainant_name: '',
    complainant_address: '',
    complainant_contact: '',
    respondent_name: '',
    respondent_address: '',
    respondent_contact: '',
    incident_type: '',
    incident_date: '',
    incident_location: '',
    summary: '',
    status: 'open',
    resolution: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await blottersAPI.getBlotters();
      setBlotters(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBlotter) {
        await blottersAPI.updateBlotter(editingBlotter.id, formData);
      } else {
        await blottersAPI.createBlotter(formData);
      }
      await fetchData();
      setShowForm(false);
      setEditingBlotter(null);
      resetForm();
    } catch (error) {
      console.error('Error saving blotter:', error);
    }
  };

  const handleEdit = (blotter) => {
    setEditingBlotter(blotter);
    setFormData({
      complainant_name: blotter.complainant_name,
      complainant_address: blotter.complainant_address,
      complainant_contact: blotter.complainant_contact || '',
      respondent_name: blotter.respondent_name || '',
      respondent_address: blotter.respondent_address || '',
      respondent_contact: blotter.respondent_contact || '',
      incident_type: blotter.incident_type,
      incident_date: blotter.incident_date.split('T')[0],
      incident_location: blotter.incident_location,
      summary: blotter.summary,
      status: blotter.status,
      resolution: blotter.resolution || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blotter record?')) {
      try {
        await blottersAPI.deleteBlotter(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting blotter:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      complainant_name: '',
      complainant_address: '',
      complainant_contact: '',
      respondent_name: '',
      respondent_address: '',
      respondent_contact: '',
      incident_type: '',
      incident_date: '',
      incident_location: '',
      summary: '',
      status: 'open',
      resolution: '',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'under_investigation': return 'bg-yellow-100 text-yellow-800';
      case 'settled': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'theft': return 'bg-red-100 text-red-800';
      case 'assault': return 'bg-orange-100 text-orange-800';
      case 'dispute': return 'bg-yellow-100 text-yellow-800';
      case 'noise': return 'bg-blue-100 text-blue-800';
      case 'property': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBlotters = blotters.filter(blotter => {
    const matchesSearch = blotter.blotter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blotter.complainant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blotter.respondent_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || blotter.status === filterStatus;
    const matchesType = !filterType || blotter.incident_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredBlotters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBlotters = filteredBlotters.slice(startIndex, endIndex);

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
          <h1 className="text-3xl font-bold text-gray-900">Blotter Management</h1>
          <p className="text-gray-600 mt-1">Record and track incident reports</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium"
        >
          New Blotter Entry
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Search Blotters</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by blotter number or names..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="settled">Settled</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="theft">Theft</option>
              <option value="assault">Assault</option>
              <option value="dispute">Dispute</option>
              <option value="noise">Noise Complaint</option>
              <option value="property">Property Damage</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="bg-red-50 rounded-lg p-4 w-full">
              <div className="text-sm font-medium text-red-800">Total Cases</div>
              <div className="text-2xl font-bold text-red-900">{blotters.length}</div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Blotter Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Complainant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Respondent</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Incident Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBlotters.map((blotter) => (
                <tr key={blotter.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{blotter.blotter_number}</div>
                    <div className="text-xs text-gray-500">{new Date(blotter.incident_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{blotter.complainant_name}</div>
                    <div className="text-xs text-gray-500">{blotter.complainant_contact || 'No contact'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{blotter.respondent_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{blotter.respondent_contact || 'No contact'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(blotter.incident_type)}`}>
                      {blotter.incident_type.charAt(0).toUpperCase() + blotter.incident_type.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(blotter.status)}`}>
                      {blotter.status.charAt(0).toUpperCase() + blotter.status.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(blotter)}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blotter.id)}
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-2xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingBlotter ? 'Edit Blotter Entry' : 'New Blotter Entry'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingBlotter(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Complainant Name</label>
                    <input
                      type="text"
                      value={formData.complainant_name}
                      onChange={(e) => setFormData({...formData, complainant_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Complainant Contact</label>
                    <input
                      type="tel"
                      value={formData.complainant_contact}
                      onChange={(e) => setFormData({...formData, complainant_contact: e.target.value})}
                      placeholder="09XXXXXXXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Complainant Address</label>
                  <textarea
                    value={formData.complainant_address}
                    onChange={(e) => setFormData({...formData, complainant_address: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Respondent Name</label>
                    <input
                      type="text"
                      value={formData.respondent_name}
                      onChange={(e) => setFormData({...formData, respondent_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Respondent Contact</label>
                    <input
                      type="tel"
                      value={formData.respondent_contact}
                      onChange={(e) => setFormData({...formData, respondent_contact: e.target.value})}
                      placeholder="09XXXXXXXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Respondent Address</label>
                  <textarea
                    value={formData.respondent_address}
                    onChange={(e) => setFormData({...formData, respondent_address: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Incident Type</label>
                    <select
                      value={formData.incident_type}
                      onChange={(e) => setFormData({...formData, incident_type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="theft">Theft</option>
                      <option value="assault">Assault</option>
                      <option value="dispute">Dispute</option>
                      <option value="noise">Noise Complaint</option>
                      <option value="property">Property Damage</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Incident Date</label>
                    <input
                      type="datetime-local"
                      value={formData.incident_date}
                      onChange={(e) => setFormData({...formData, incident_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="open">Open</option>
                      <option value="under_investigation">Under Investigation</option>
                      <option value="settled">Settled</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Incident Location</label>
                  <input
                    type="text"
                    value={formData.incident_location}
                    onChange={(e) => setFormData({...formData, incident_location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Summary</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Resolution</label>
                  <textarea
                    value={formData.resolution}
                    onChange={(e) => setFormData({...formData, resolution: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingBlotter(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg"
                  >
                    {editingBlotter ? 'Update Blotter' : 'Create Blotter'}
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

export default BlottersManagement;
