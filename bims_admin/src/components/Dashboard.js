import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { residentsAPI, documentsAPI, blottersAPI, announcementsAPI, coreAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    residents: { total_residents: 0, voters: 0, pwd: 0, senior_citizens: 0 },
    documents: { total_requests: 0, pending_requests: 0, approved_requests: 0, released_requests: 0 },
    blotters: { total_blotters: 0, open_cases: 0, under_investigation: 0, settled_cases: 0 },
    announcements: { total_announcements: 0, published_announcements: 0, draft_announcements: 0, featured_announcements: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
  }, [dateFilter]);

  const fetchStats = async () => {
    try {
      const [residentsRes, documentsRes, blottersRes, announcementsRes] = await Promise.all([
        residentsAPI.getStats(),
        documentsAPI.getDocumentStats(),
        blottersAPI.getBlotterStats(),
        announcementsAPI.getAnnouncementStats(),
      ]);
      setStats({
        residents: residentsRes.data,
        documents: documentsRes.data,
        blotters: blottersRes.data,
        announcements: announcementsRes.data,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await coreAPI.getRecentActivities(20, dateFilter.from || null, dateFilter.to || null);
      setRecentActivities(response.data);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearDateFilter = () => {
    setDateFilter({ from: '', to: '' });
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of barangay operations and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Residents</p>
              <p className="text-3xl font-bold text-blue-900">{stats.residents.total_residents}</p>
              <p className="text-xs text-blue-500 mt-1">Registered citizens</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Document Requests</p>
              <p className="text-3xl font-bold text-green-900">{stats.documents.total_requests}</p>
              <p className="text-xs text-green-500 mt-1">Pending: {stats.documents.pending_requests}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Blotter Cases</p>
              <p className="text-3xl font-bold text-red-900">{stats.blotters.total_blotters}</p>
              <p className="text-xs text-red-500 mt-1">Open: {stats.blotters.open_cases}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Announcements</p>
              <p className="text-3xl font-bold text-orange-900">{stats.announcements.total_announcements}</p>
              <p className="text-xs text-orange-500 mt-1">Published: {stats.announcements.published_announcements}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Registered Voters</p>
              <p className="text-3xl font-bold text-purple-900">{stats.residents.voters}</p>
              <p className="text-xs text-purple-500 mt-1">Eligible voters</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => handleDateFilterChange('from', e.target.value)}
                className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => handleDateFilterChange('to', e.target.value)}
                className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To"
              />
              {(dateFilter.from || dateFilter.to) && (
                <button
                  onClick={clearDateFilter}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-center space-x-3 py-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.action === 'create' ? 'bg-green-500' :
                    activity.action === 'update' ? 'bg-blue-500' :
                    activity.action === 'delete' ? 'bg-red-500' :
                    activity.action === 'export' ? 'bg-purple-500' :
                    activity.action === 'login' ? 'bg-indigo-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{activity.description}</div>
                    <div className="text-xs text-gray-500">
                      {activity.user_name} • {activity.time_ago}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                No activities found for the selected date range
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/residents')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-150"
            >
              Add New Resident
            </button>
            <button 
              onClick={() => navigate('/documents')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-150"
            >
              Create Document Request
            </button>
            <button 
              onClick={() => navigate('/blotters')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-150"
            >
              Record Blotter Entry
            </button>
            <button 
              onClick={() => navigate('/announcements')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-150"
            >
              Create Announcement
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-150"
            >
              Generate Reports
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to B-SIMS</h3>
            <p className="text-sm text-gray-600">Your comprehensive barangay management solution is ready for use</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;