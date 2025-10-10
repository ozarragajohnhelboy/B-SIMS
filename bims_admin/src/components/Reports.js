import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { residentsAPI, documentsAPI, blottersAPI } from '../services/api';

const Reports = () => {
  const navigate = useNavigate();
  const [residentStats, setResidentStats] = useState(null);
  const [documentStats, setDocumentStats] = useState(null);
  const [blotterStats, setBlotterStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [residentsRes, documentsRes, blottersRes] = await Promise.all([
        residentsAPI.getStats(),
        documentsAPI.getDocumentStats(),
        blottersAPI.getBlotterStats(),
      ]);
      setResidentStats(residentsRes.data);
      setDocumentStats(documentsRes.data);
      setBlotterStats(blottersRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive overview of barangay data and statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Resident Statistics</h3>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Residents</span>
              <span className="text-lg font-semibold text-gray-900">{residentStats?.total_residents || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Registered Voters</span>
              <span className="text-lg font-semibold text-gray-900">{residentStats?.voters || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">PWD</span>
              <span className="text-lg font-semibold text-gray-900">{residentStats?.pwd || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Senior Citizens</span>
              <span className="text-lg font-semibold text-gray-900">{residentStats?.senior_citizens || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Document Requests</h3>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Requests</span>
              <span className="text-lg font-semibold text-gray-900">{documentStats?.total_requests || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-lg font-semibold text-yellow-600">{documentStats?.pending_requests || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Approved</span>
              <span className="text-lg font-semibold text-blue-600">{documentStats?.approved_requests || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Released</span>
              <span className="text-lg font-semibold text-green-600">{documentStats?.released_requests || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Blotter Cases</h3>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-red-600 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Cases</span>
              <span className="text-lg font-semibold text-gray-900">{blotterStats?.total_blotters || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Open Cases</span>
              <span className="text-lg font-semibold text-red-600">{blotterStats?.open_cases || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Under Investigation</span>
              <span className="text-lg font-semibold text-yellow-600">{blotterStats?.under_investigation || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Settled Cases</span>
              <span className="text-lg font-semibold text-green-600">{blotterStats?.settled_cases || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <div className="space-y-3">
            {residentStats?.gender_distribution?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${item.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                  <span className="text-sm text-gray-600 capitalize">{item.gender}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
            )) || (
              <div className="text-sm text-gray-500">No data available</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purok Distribution</h3>
          <div className="space-y-3">
            {residentStats?.purok_distribution?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item['household__purok__name'] || 'Unknown'}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
            )) || (
              <div className="text-sm text-gray-500">No data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/residents')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-left"
          >
            <div className="text-sm font-medium text-gray-900 mb-1">Export Resident List</div>
            <div className="text-xs text-gray-500">Generate CSV report of all residents</div>
          </button>
          <button 
            onClick={() => navigate('/documents')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-left"
          >
            <div className="text-sm font-medium text-gray-900 mb-1">Document Summary</div>
            <div className="text-xs text-gray-500">Create PDF summary of document requests</div>
          </button>
          <button 
            onClick={() => navigate('/blotters')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-left"
          >
            <div className="text-sm font-medium text-gray-900 mb-1">Blotter Report</div>
            <div className="text-xs text-gray-500">Generate incident report for authorities</div>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Health</h3>
            <p className="text-sm text-gray-600">All systems are operational and data is up to date</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
