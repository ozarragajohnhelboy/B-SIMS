import React, { useState, useEffect } from 'react';
import { residentsAPI, puroksAPI, householdsAPI } from '../services/api';

const ResidentsManagement = () => {
  const [residents, setResidents] = useState([]);
  const [puroks, setPuroks] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurok, setFilterPurok] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    birth_date: '',
    gender: '',
    marital_status: '',
    occupation: '',
    monthly_income: '',
    household: '',
    relationship_to_head: 'head',
    emergency_contact_name: '',
    emergency_contact_number: '',
    is_voter: false,
    is_pwd: false,
    is_senior_citizen: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [residentsRes, puroksRes, householdsRes] = await Promise.all([
        residentsAPI.getResidents(),
        puroksAPI.getPuroks(),
        householdsAPI.getHouseholds(),
      ]);
      setResidents(residentsRes.data.results || residentsRes.data);
      setPuroks(puroksRes.data.results || puroksRes.data);
      setHouseholds(householdsRes.data.results || householdsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResident) {
        await residentsAPI.updateResident(editingResident.id, formData);
      } else {
        await residentsAPI.createResident(formData);
      }
      await fetchData();
      setShowForm(false);
      setEditingResident(null);
      resetForm();
    } catch (error) {
      console.error('Error saving resident:', error);
    }
  };

  const handleEdit = (resident) => {
    setEditingResident(resident);
    setFormData({
      first_name: resident.first_name,
      last_name: resident.last_name,
      middle_name: resident.middle_name || '',
      suffix: resident.suffix || '',
      birth_date: resident.birth_date,
      gender: resident.gender,
      marital_status: resident.marital_status,
      occupation: resident.occupation || '',
      monthly_income: resident.monthly_income || '',
      household: resident.household,
      relationship_to_head: resident.relationship_to_head,
      emergency_contact_name: resident.emergency_contact_name || '',
      emergency_contact_number: resident.emergency_contact_number || '',
      is_voter: resident.is_voter,
      is_pwd: resident.is_pwd,
      is_senior_citizen: resident.is_senior_citizen,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resident?')) {
      try {
        await residentsAPI.deleteResident(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting resident:', error);
      }
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'First Name', 'Last Name', 'Middle Name', 'Suffix', 'Birth Date', 'Gender', 'Marital Status', 'Occupation', 'Monthly Income', 'Household', 'Relationship to Head', 'Emergency Contact Name', 'Emergency Contact Number', 'Is Voter', 'Is PWD', 'Is Senior Citizen'],
      ...residents.map(resident => [
        resident.id,
        resident.first_name,
        resident.last_name,
        resident.middle_name || '',
        resident.suffix || '',
        resident.birth_date,
        resident.gender,
        resident.marital_status,
        resident.occupation || '',
        resident.monthly_income || '',
        resident.household?.household_number || '',
        resident.relationship_to_head,
        resident.emergency_contact_name || '',
        resident.emergency_contact_number || '',
        resident.is_voter ? 'Yes' : 'No',
        resident.is_pwd ? 'Yes' : 'No',
        resident.is_senior_citizen ? 'Yes' : 'No'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `residents_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const residentsData = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const resident = {};
          headers.forEach((header, index) => {
            resident[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || '';
          });
          return resident;
        });

        for (const residentData of residentsData) {
          if (residentData.first_name && residentData.last_name) {
            const household = households.find(h => h.household_number === residentData.household);
            await residentsAPI.createResident({
              ...residentData,
              household: household?.id || '',
              monthly_income: residentData.monthly_income ? parseFloat(residentData.monthly_income) : 0,
              is_voter: residentData.is_voter === 'Yes',
              is_pwd: residentData.is_pwd === 'Yes',
              is_senior_citizen: residentData.is_senior_citizen === 'Yes'
            });
          }
        }
        
        await fetchData();
        alert('Residents imported successfully!');
      } catch (error) {
        console.error('Error importing residents:', error);
        alert('Error importing residents. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      middle_name: '',
      suffix: '',
      birth_date: '',
      gender: '',
      marital_status: '',
      occupation: '',
      monthly_income: '',
      household: '',
      relationship_to_head: 'head',
      emergency_contact_name: '',
      emergency_contact_number: '',
      is_voter: false,
      is_pwd: false,
      is_senior_citizen: false,
    });
  };

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.barangay_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPurok = !filterPurok || resident.household?.purok === parseInt(filterPurok);
    const matchesGender = !filterGender || resident.gender === filterGender;
    return matchesSearch && matchesPurok && matchesGender;
  });

  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResidents = filteredResidents.slice(startIndex, endIndex);

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
        <h1 className="text-2xl font-bold text-gray-900">Residents Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            Export CSV
          </button>
          <button
            onClick={() => document.getElementById('importFile').click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Import CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Add New Resident
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purok</label>
            <select
              value={filterPurok}
              onChange={(e) => setFilterPurok(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Puroks</option>
              {puroks.map(purok => (
                <option key={purok.id} value={purok.id}>{purok.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Household</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedResidents.map((resident) => (
                <tr key={resident.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{resident.full_name}</div>
                    <div className="text-sm text-gray-500">{resident.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resident.barangay_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resident.age}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resident.household_number} - {resident.purok_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {resident.is_voter && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Voter</span>}
                      {resident.is_pwd && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">PWD</span>}
                      {resident.is_senior_citizen && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Senior</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(resident)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resident.id)}
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingResident ? 'Edit Resident' : 'Add New Resident'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                    <input
                      type="text"
                      value={formData.middle_name}
                      onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Suffix</label>
                    <input
                      type="text"
                      value={formData.suffix}
                      onChange={(e) => setFormData({...formData, suffix: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) => setFormData({...formData, marital_status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="widowed">Widowed</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Household</label>
                  <select
                    value={formData.household}
                    onChange={(e) => setFormData({...formData, household: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Household</option>
                    {households.map(household => (
                      <option key={household.id} value={household.id}>
                        {household.household_number} - {household.purok_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_voter}
                      onChange={(e) => setFormData({...formData, is_voter: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Voter</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_pwd}
                      onChange={(e) => setFormData({...formData, is_pwd: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">PWD</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_senior_citizen}
                      onChange={(e) => setFormData({...formData, is_senior_citizen: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Senior Citizen</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingResident(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingResident ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <input
        id="importFile"
        type="file"
        accept=".csv"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ResidentsManagement;
