import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';

const ProjectManagement = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([
    { id: 1, name: 'Infrastructure Development', description: 'Road construction, bridge building, barangay hall improvements' },
    { id: 2, name: 'Livelihood Programs', description: 'Skills training, micro-enterprise development, income-generating activities' },
    { id: 3, name: 'Health Services', description: 'Health center improvements, medical equipment, community health programs' },
    { id: 4, name: 'Education Support', description: 'School facilities, learning materials, educational programs' },
    { id: 5, name: 'Environmental Protection', description: 'Tree planting, waste management, environmental conservation' },
    { id: 6, name: 'Social Services', description: 'Senior citizen programs, PWD support, social welfare initiatives' },
    { id: 7, name: 'Disaster Preparedness', description: 'Emergency response equipment, evacuation centers, disaster training' },
    { id: 8, name: 'Sports & Recreation', description: 'Sports facilities, playgrounds, recreational activities' },
    { id: 9, name: 'Peace & Order', description: 'Security measures, community watch programs, safety initiatives' },
    { id: 10, name: 'Youth Development', description: 'Youth programs, leadership training, skills development' }
  ]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    project_type: '',
    status: 'planning',
    priority: 'medium',
    budget_allocated: '',
    start_date: '',
    end_date: '',
    location: '',
    is_public: true
  });
  const [showProjectEdit, setShowProjectEdit] = useState(false);
  const [editProjectData, setEditProjectData] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    start_datetime: '',
    end_datetime: '',
    location: '',
    budget_allocated: '',
    is_public: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, eventsRes, statsRes] = await Promise.all([
        projectsAPI.getProjects(),
        projectsAPI.getCommunityEvents(),
        projectsAPI.getProjectStats()
      ]);
      
      setProjects(projectsRes.data.results || projectsRes.data || []);
      setEvents(eventsRes.data.results || eventsRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...projectFormData,
        project_type: parseInt(projectFormData.project_type),
        budget_allocated: parseFloat(projectFormData.budget_allocated)
      };
      await projectsAPI.createProject(formData);
      setShowProjectForm(false);
      setProjectFormData({
        title: '',
        description: '',
        project_type: '',
        status: 'planning',
        priority: 'medium',
        budget_allocated: '',
        start_date: '',
        end_date: '',
        location: '',
        is_public: true
      });
      fetchData();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleExportProjects = () => {
    const csvContent = [
      ['ID', 'Project Title', 'Project Type', 'Description', 'Budget Allocated', 'Progress', 'Start Date', 'End Date', 'Status', 'Project Manager'],
      ...projects.map(project => [
        project.id,
        project.title,
        project.project_type?.name || '',
        project.description,
        project.budget_allocated,
        project.progress,
        project.start_date,
        project.end_date || '',
        project.status,
        project.project_manager?.first_name + ' ' + project.project_manager?.last_name || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `projects_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.project_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPagesProjects = Math.ceil(filteredProjects.length / itemsPerPage);
  const totalPagesEvents = Math.ceil(filteredEvents.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.createCommunityEvent(eventFormData);
      setShowEventForm(false);
      setEventFormData({
        title: '',
        description: '',
        event_type: 'meeting',
        start_datetime: '',
        end_datetime: '',
        location: '',
        budget_allocated: '',
        is_public: true
      });
      fetchData();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-yellow-100 text-yellow-800',
      'ongoing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'on_hold': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project & Activity Monitoring</h1>
          <p className="text-gray-600 mt-1">Track barangay projects and community events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Projects</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total_projects || 0}</p>
              <p className="text-xs text-blue-500 mt-1">All projects</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Ongoing Projects</p>
              <p className="text-3xl font-bold text-green-900">{stats.ongoing_projects || 0}</p>
              <p className="text-xs text-green-500 mt-1">In progress</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Completed Projects</p>
              <p className="text-3xl font-bold text-purple-900">{stats.completed_projects || 0}</p>
              <p className="text-xs text-purple-500 mt-1">Finished</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Budget</p>
              <p className="text-3xl font-bold text-orange-900">₱{(stats.total_budget || 0).toLocaleString()}</p>
              <p className="text-xs text-orange-500 mt-1">Allocated</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className={`w-4 h-4 ${activeTab === 'projects' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Projects</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'events'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className={`w-4 h-4 ${activeTab === 'events' ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Events</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportProjects}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Project
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
                </div>
              </div>

              {showProjectForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" onClick={() => setShowProjectForm(false)}>
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                              Add New Project
                            </h3>
                            <form onSubmit={handleProjectSubmit} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                  <input
                                    type="text"
                                    value={projectFormData.title}
                                    onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                                  <select
                                    value={projectFormData.project_type}
                                    onChange={(e) => setProjectFormData({...projectFormData, project_type: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  >
                                    <option value="">Select Type</option>
                                    {projectTypes.map(type => (
                                      <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                  value={projectFormData.description}
                                  onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                  <select
                                    value={projectFormData.status}
                                    onChange={(e) => setProjectFormData({...projectFormData, status: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="planning">Planning</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="on_hold">On Hold</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                  <select
                                    value={projectFormData.priority}
                                    onChange={(e) => setProjectFormData({...projectFormData, priority: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={projectFormData.budget_allocated}
                                    onChange={(e) => setProjectFormData({...projectFormData, budget_allocated: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                  <input
                                    type="date"
                                    value={projectFormData.start_date}
                                    onChange={(e) => setProjectFormData({...projectFormData, start_date: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                  <input
                                    type="date"
                                    value={projectFormData.end_date}
                                    onChange={(e) => setProjectFormData({...projectFormData, end_date: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                  type="text"
                                  value={projectFormData.location}
                                  onChange={(e) => setProjectFormData({...projectFormData, location: e.target.value})}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          onClick={handleProjectSubmit}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Save Project
                        </button>
                        <button
                          onClick={() => setShowProjectForm(false)}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedProjects.map(project => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.title}</div>
                            <div className="text-sm text-gray-500">{project.project_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full" style={{backgroundColor: project.project_type_color + '20', color: project.project_type_color}}>
                            {project.project_type_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={project.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                await projectsAPI.patchProject(project.id, { status: newStatus });
                                fetchData();
                              } catch (err) {
                                console.error('Failed to update status', err);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 ${getStatusColor(project.status)} border border-transparent hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400`}
                            style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                          >
                            <option value="planning">Planning</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="on_hold">On Hold</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{width: `${project.progress_percentage}%`}}></div>
                            </div>
                            <span className="text-sm text-gray-900">{project.progress_percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₱{parseFloat(project.budget_allocated).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => { setEditProjectData(project); setShowProjectEdit(true); }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm('Delete this project?')) return;
                              try {
                                await projectsAPI.deleteProject(project.id);
                                fetchData();
                              } catch (err) {
                                console.error('Failed to delete project', err);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPagesProjects > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPagesProjects }, (_, i) => i + 1).map(page => (
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
                    onClick={() => setCurrentPage(Math.min(totalPagesProjects, currentPage + 1))}
                    disabled={currentPage === totalPagesProjects}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
              {showProjectEdit && editProjectData && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" onClick={() => setShowProjectEdit(false)}>
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Project</h3>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                  <input
                                    type="text"
                                    value={editProjectData.title || ''}
                                    onChange={(e) => setEditProjectData({ ...editProjectData, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                  <select
                                    value={editProjectData.status}
                                    onChange={(e) => setEditProjectData({ ...editProjectData, status: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="planning">Planning</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="on_hold">On Hold</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                  value={editProjectData.description || ''}
                                  onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                  <select
                                    value={editProjectData.priority}
                                    onChange={(e) => setEditProjectData({ ...editProjectData, priority: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editProjectData.budget_allocated}
                                    onChange={(e) => setEditProjectData({ ...editProjectData, budget_allocated: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Public</label>
                                  <select
                                    value={editProjectData.is_public ? 'true' : 'false'}
                                    onChange={(e) => setEditProjectData({ ...editProjectData, is_public: e.target.value === 'true' })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                  <input
                                    type="date"
                                    value={editProjectData.start_date?.slice(0,10) || ''}
                                    onChange={(e) => setEditProjectData({ ...editProjectData, start_date: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                  <input
                                    type="date"
                                    value={editProjectData.end_date?.slice(0,10) || ''}
                                    onChange={(e) => setEditProjectData({ ...editProjectData, end_date: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                  type="text"
                                  value={editProjectData.location || ''}
                                  onChange={(e) => setEditProjectData({ ...editProjectData, location: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          onClick={async () => {
                            try {
                              const payload = {
                                title: editProjectData.title,
                                description: editProjectData.description,
                                status: editProjectData.status,
                                priority: editProjectData.priority,
                                budget_allocated: editProjectData.budget_allocated,
                                start_date: editProjectData.start_date,
                                end_date: editProjectData.end_date,
                                location: editProjectData.location,
                                is_public: editProjectData.is_public,
                              };
                              await projectsAPI.patchProject(editProjectData.id, payload);
                              setShowProjectEdit(false);
                              setEditProjectData(null);
                              fetchData();
                            } catch (err) {
                              console.error('Failed to update project', err);
                            }
                          }}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => { setShowProjectEdit(false); setEditProjectData(null); }}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Community Events</h3>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Event
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} events
                </div>
              </div>

              {showEventForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" onClick={() => setShowEventForm(false)}>
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                              Add New Event
                            </h3>
                            <form onSubmit={handleEventSubmit} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                                  <input
                                    type="text"
                                    value={eventFormData.title}
                                    onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                                  <select
                                    value={eventFormData.event_type}
                                    onChange={(e) => setEventFormData({...eventFormData, event_type: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                  >
                                    <option value="meeting">Community Meeting</option>
                                    <option value="festival">Festival/Celebration</option>
                                    <option value="training">Training/Seminar</option>
                                    <option value="health">Health Program</option>
                                    <option value="sports">Sports Event</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                  value={eventFormData.description}
                                  onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  rows="3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                                  <input
                                    type="datetime-local"
                                    value={eventFormData.start_datetime}
                                    onChange={(e) => setEventFormData({...eventFormData, start_datetime: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                                  <input
                                    type="datetime-local"
                                    value={eventFormData.end_datetime}
                                    onChange={(e) => setEventFormData({...eventFormData, end_datetime: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                  <input
                                    type="text"
                                    value={eventFormData.location}
                                    onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={eventFormData.budget_allocated}
                                    onChange={(e) => setEventFormData({...eventFormData, budget_allocated: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          onClick={handleEventSubmit}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Save Event
                        </button>
                        <button
                          onClick={() => setShowEventForm(false)}
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
                {paginatedEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.event_number}</p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {event.event_type}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Location:</span>
                        <span className="ml-2 text-gray-600">{event.location}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Start:</span>
                        <span className="ml-2 text-gray-600">{new Date(event.start_datetime).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Budget:</span>
                        <span className="ml-2 text-gray-600">₱{parseFloat(event.budget_allocated).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPagesEvents > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPagesEvents }, (_, i) => i + 1).map(page => (
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
                    onClick={() => setCurrentPage(Math.min(totalPagesEvents, currentPage + 1))}
                    disabled={currentPage === totalPagesEvents}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
