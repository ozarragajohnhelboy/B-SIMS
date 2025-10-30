import React, { useState, useEffect } from 'react';
import { documentsAPI, residentsAPI } from '../services/api';
import Alert from './Alert';
import ConfirmationDialog from './ConfirmationDialog';

const DocumentsManagement = () => {
  const [documentRequests, setDocumentRequests] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, requestNumber: '' });
  const [formData, setFormData] = useState({
    resident: '',
    document_type: '',
    purpose: '',
    fee_paid: '',
    status: 'pending',
    remarks: '',
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, typesRes, residentsRes] = await Promise.all([
        documentsAPI.getDocumentRequests(),
        documentsAPI.getDocumentTypes(),
        residentsAPI.getResidents(),
      ]);
      setDocumentRequests(requestsRes.data.results || requestsRes.data);
      setDocumentTypes(typesRes.data.results || typesRes.data);
      setResidents(residentsRes.data.results || residentsRes.data);
    } catch (error) {
      showAlert('error', 'Failed to load documents data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.resident) {
      showAlert('error', 'Resident is required');
      return;
    }
    
    if (!formData.document_type) {
      showAlert('error', 'Document type is required');
      return;
    }
    
    if (!formData.purpose.trim()) {
      showAlert('error', 'Purpose is required');
      return;
    }

    try {
      const submitData = {
        ...formData,
        resident: parseInt(formData.resident),
        document_type: parseInt(formData.document_type),
        fee_paid: parseFloat(formData.fee_paid) || 0
      };
      
      if (editingRequest) {
        await documentsAPI.updateDocumentRequest(editingRequest.id, submitData);
        showAlert('success', 'Document request updated successfully');
      } else {
        await documentsAPI.createDocumentRequest(submitData);
        showAlert('success', 'Document request created successfully');
      }
      await fetchData();
      setShowForm(false);
      setEditingRequest(null);
      resetForm();
    } catch (error) {
      showAlert('error', 'Failed to save document request');
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    const feeToUse = request.fee_paid && parseFloat(request.fee_paid) > 0 
      ? request.fee_paid 
      : (request.document_type_fee || '');
    
    setFormData({
      resident: request.resident,
      document_type: request.document_type,
      purpose: request.purpose,
      fee_paid: feeToUse,
      status: request.status,
      remarks: request.remarks || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const request = documentRequests.find(r => r.id === id);
    setDeleteConfirm({ 
      show: true, 
      id: id, 
      requestNumber: request?.request_number || 'this document request'
    });
  };

  const confirmDelete = async () => {
    try {
      await documentsAPI.deleteDocumentRequest(deleteConfirm.id);
      showAlert('success', 'Document request deleted successfully');
      await fetchData();
    } catch (error) {
      showAlert('error', 'Failed to delete document request');
    } finally {
      setDeleteConfirm({ show: false, id: null, requestNumber: '' });
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const request = documentRequests.find(r => r.id === requestId);
      const updateData = {
        resident: request.resident,
        document_type: request.document_type,
        purpose: request.purpose,
        fee_paid: request.fee_paid || 0,
        status: newStatus,
        remarks: request.remarks || ''
      };
      
      await documentsAPI.updateDocumentRequest(requestId, updateData);
      showAlert('success', 'Status updated successfully');
      await fetchData();
    } catch (error) {
      showAlert('error', 'Failed to update status');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null, requestNumber: '' });
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Request Number', 'Resident Name', 'Document Type', 'Purpose', 'Status', 'Request Date', 'Approved Date', 'Released Date', 'Remarks'],
      ...documentRequests.map(request => [
        request.id,
        request.request_number,
        request.resident?.first_name + ' ' + request.resident?.last_name || '',
        request.document_type?.name || '',
        request.purpose,
        request.status,
        request.request_date,
        request.approved_date || '',
        request.released_date || '',
        request.remarks || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `documents_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormData({
      resident: '',
      document_type: '',
      purpose: '',
      fee_paid: '',
      status: 'pending',
      remarks: '',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'released': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = documentRequests.filter(request => {
    const matchesSearch = request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.resident_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || request.status === filterStatus;
    const matchesType = !filterType || request.document_type === parseInt(filterType);
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

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
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-1">Manage document requests and processing</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium"
          >
            New Document Request
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Search Requests</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by request number or resident..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="released">Released</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Types</option>
              {documentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="bg-green-50 rounded-lg p-4 w-full">
              <div className="text-sm font-medium text-green-800">Total Requests</div>
              <div className="text-2xl font-bold text-green-900">{documentRequests.length}</div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Resident</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Document Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee Paid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{request.request_number}</div>
                    <div className="text-xs text-gray-500">{new Date(request.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.resident_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.document_type_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request.id, e.target.value)}
                      className={`px-4 py-1.5 pr-10 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 ${getStatusColor(request.status)} border border-transparent hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400`}
                      style={{ 
                        WebkitAppearance: 'none', 
                        MozAppearance: 'none', 
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.7rem center',
                        backgroundSize: '0.75rem',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="released">Released</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{request.fee_paid || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(request)}
                        className="text-green-600 hover:text-green-900 font-medium transition-colors duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(request.id)}
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
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-2xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingRequest ? 'Edit Document Request' : 'New Document Request'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRequest(null);
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Resident</label>
                    <select
                      value={formData.resident}
                      onChange={(e) => setFormData({...formData, resident: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select Resident</option>
                      {residents.map(resident => (
                        <option key={resident.id} value={resident.id}>{resident.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                    <select
                      value={formData.document_type}
                      onChange={(e) => {
                        const docTypeId = parseInt(e.target.value);
                        const selectedType = documentTypes.find(t => t.id === docTypeId);
                        setFormData({
                          ...formData, 
                          document_type: e.target.value,
                          fee_paid: selectedType ? selectedType.required_fee : ''
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select Document Type</option>
                      {documentTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name} (₱{type.required_fee || '0.00'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fee Paid</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fee_paid}
                      onChange={(e) => setFormData({...formData, fee_paid: e.target.value})}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="released">Released</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRequest(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg"
                  >
                    {editingRequest ? 'Update Request' : 'Create Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Alert
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ show: false, type: '', message: '' })}
      />

      <ConfirmationDialog
        show={deleteConfirm.show}
        title="Delete Document Request"
        message={`Are you sure you want to delete ${deleteConfirm.requestNumber}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DocumentsManagement;
