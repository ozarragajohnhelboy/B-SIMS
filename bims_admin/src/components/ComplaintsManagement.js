import React, { useState, useEffect } from 'react';
import { complaintsAPI } from '../services/api';
import Alert from './Alert';

const IncidentsManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('acknowledged');

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      
      const response = await complaintsAPI.getComplaints({ params });
      setComplaints(response.data.results || response.data);
    } catch (error) {
      showAlert('error', 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };
  
  const getIncidentTypeLabel = (type) => {
    const types = {
      disturbance: 'Disturbance',
      missing_item: 'Missing Item',
      accident: 'Accident',
      property_damage: 'Property Damage',
      noise_complaint: 'Noise Complaint',
      health_concern: 'Health Concern',
      sanitation: 'Sanitation Issue',
      streetlight: 'Streetlight/Infrastructure',
      stray_animals: 'Stray Animals',
      other: 'Other',
    };
    return types[type] || type;
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };

  const handleReply = (complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint.response || '');
    setReplyStatus(complaint.status === 'pending' ? 'acknowledged' : complaint.status);
    setShowReplyModal(true);
    setShowViewModal(false);
  };

  const handleSubmitReply = async () => {
    try {
      const updateData = {
        title: selectedComplaint.title,
        details: selectedComplaint.details,
        submitted_by: selectedComplaint.submitted_by,
        response: replyText,
        status: replyStatus,
      };
      
      await complaintsAPI.updateComplaint(selectedComplaint.id, updateData);
      showAlert('success', 'Response sent successfully');
      setShowReplyModal(false);
      setSelectedComplaint(null);
      setReplyText('');
      setReplyStatus('acknowledged');
      await fetchData();
    } catch (error) {
      showAlert('error', 'Failed to send response');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      received: 'bg-blue-100 text-blue-800',
      acknowledged: 'bg-indigo-100 text-indigo-800',
      in_progress: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.received;
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = !searchTerm || 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.submitted_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || complaint.status === filterStatus;
    const matchesType = !filterType || complaint.incident_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Loading incidents...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Alert show={alert.show} type={alert.type} message={alert.message} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Incidents & Complaints Management</h1>
        <p className="text-gray-600">View and respond to resident incident reports and complaints</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search incidents..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Incident Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="disturbance">Disturbance</option>
              <option value="missing_item">Missing Item</option>
              <option value="accident">Accident</option>
              <option value="property_damage">Property Damage</option>
              <option value="noise_complaint">Noise Complaint</option>
              <option value="health_concern">Health Concern</option>
              <option value="sanitation">Sanitation Issue</option>
              <option value="streetlight">Streetlight/Infrastructure</option>
              <option value="stray_animals">Stray Animals</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="received">Received</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Total: <span className="font-bold">{filteredComplaints.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title & Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted By</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedComplaints.map((complaint) => (
              <tr key={complaint.id} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => handleViewComplaint(complaint)}>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">{complaint.title}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {getIncidentTypeLabel(complaint.incident_type || 'other')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{complaint.details}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{complaint.submitted_by_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={complaint.status}
                    onChange={(e) => {
                      const updateData = {
                        title: complaint.title,
                        details: complaint.details,
                        submitted_by: complaint.submitted_by,
                        status: e.target.value,
                        response: complaint.response || '',
                      };
                      complaintsAPI.updateComplaint(complaint.id, updateData).then(() => {
                        showAlert('success', 'Status updated');
                        fetchData();
                      }).catch(() => {
                        showAlert('error', 'Failed to update status');
                      });
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 ${getStatusColor(complaint.status)} border border-transparent hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400`}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                  >
                    <option value="received">Received</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleReply(complaint)}
                    className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-150"
                  >
                    Reply
                  </button>
                </td>
              </tr>
            ))}
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

      {showReplyModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-2xl rounded-xl bg-white">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Reply to Incident</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedComplaint.title}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Response</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your response..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Update Status</label>
              <select
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="received">Received</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedComplaint(null);
                  setReplyText('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Incident Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedComplaint(null);
                }}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{selectedComplaint.title}</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Incident Type</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {getIncidentTypeLabel(selectedComplaint.incident_type || 'other')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Details</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap min-h-[100px]">{selectedComplaint.details}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Submitted By</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{selectedComplaint.submitted_by_name}</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Submitted</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{new Date(selectedComplaint.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {(selectedComplaint.latitude && selectedComplaint.longitude) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {selectedComplaint.location_address || `${selectedComplaint.latitude}, ${selectedComplaint.longitude}`}
                    <a
                      href={`https://www.google.com/maps?q=${selectedComplaint.latitude},${selectedComplaint.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View on Map
                    </a>
                  </div>
                </div>
              )}

              {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Attached Images</label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedComplaint.attachments.map((attachment, index) => (
                      <div key={index} className="relative">
                        <img
                          src={attachment.image_url || attachment.image}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedComplaint.response && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Response</label>
                  <div className="px-4 py-3 bg-blue-50 rounded-lg text-gray-900 whitespace-pre-wrap">{selectedComplaint.response}</div>
                </div>
              )}

              {selectedComplaint.responded_by_name && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Responded By</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{selectedComplaint.responded_by_name}</div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedComplaint(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleReply(selectedComplaint)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsManagement;
