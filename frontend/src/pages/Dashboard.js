import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useAuth } from '../contexts/AuthContext';
import LeadDialog from '../components/LeadDialog';
import ErrorBoundary from '../components/ErrorBoundary';
import { Plus, LogOut, Filter, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/config';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    email: '',
    company: '',
    city: '',
    status: '',
    source: '',
    score_min: '',
    score_max: '',
    lead_value_min: '',
    lead_value_max: '',
    is_qualified: '',
    // Date filters
    created_at_on: '',
    created_at_before: '',
    created_at_after: '',
    created_at_from: '',
    created_at_to: '',
    last_activity_on: '',
    last_activity_before: '',
    last_activity_after: ''
  });

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Name',
      field: 'first_name',
      sortable: true,
      filter: true,
      cellRenderer: (params) => `${params.data.first_name} ${params.data.last_name}`,
      width: 150
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      headerName: 'Phone',
      field: 'phone',
      sortable: true,
      filter: true,
      width: 140
    },
    {
      headerName: 'Company',
      field: 'company',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: 'Location',
      field: 'city',
      sortable: true,
      filter: true,
      cellRenderer: (params) => `${params.data.city}, ${params.data.state}`,
      width: 150
    },
    {
      headerName: 'Source',
      field: 'source',
      sortable: true,
      filter: true,
      cellRenderer: (params) => (
        <span className={`source-badge source-${params.data.source}`}>
          {params.data.source.replace('_', ' ')}
        </span>
      ),
      width: 120
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      cellRenderer: (params) => (
        <span className={`status-badge status-${params.data.status}`}>
          {params.data.status}
        </span>
      ),
      width: 120
    },
    {
      headerName: 'Score',
      field: 'score',
      sortable: true,
      filter: true,
      width: 80
    },
    {
      headerName: 'Value',
      field: 'lead_value',
      sortable: true,
      filter: true,
      cellRenderer: (params) => `$${params.data.lead_value?.toLocaleString()}`,
      width: 100
    },
    {
      headerName: 'Qualified',
      field: 'is_qualified',
      sortable: true,
      filter: true,
      cellRenderer: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.data.is_qualified 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {params.data.is_qualified ? 'Yes' : 'No'}
        </span>
      ),
      width: 100
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditLead(params.data)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteLead(params.data.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
      width: 120
    }
  ], []);

  // AG Grid default column properties
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    suppressMenu: false
  }), []);

  // Fetch leads with filters and pagination
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await axios.get(`${API_BASE_URL}/api/leads?${params}`);
      
      setLeads(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      toast.error('Failed to fetch leads');
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Load leads on component mount and when filters/pagination change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle lead creation/update
  const handleLeadSubmit = async (leadData) => {
    try {
      if (editingLead) {
        await axios.put(`${API_BASE_URL}/api/leads/${editingLead.id}`, leadData);
        toast.success('Lead updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/leads`, leadData);
        toast.success('Lead created successfully');
      }
      setShowLeadDialog(false);
      setEditingLead(null);
      
      // Reset to first page and refresh leads
      setPagination(prev => ({ ...prev, page: 1 }));
      
      // Small delay to ensure database is updated
      setTimeout(() => {
        fetchLeads();
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save lead');
    }
  };

  // Handle lead edit
  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadDialog(true);
  };

  // Handle lead deletion
  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/leads/${leadId}`);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      email: '',
      company: '',
      city: '',
      status: '',
      source: '',
      score_min: '',
      score_max: '',
      lead_value_min: '',
      lead_value_max: '',
      is_qualified: '',
      // Date filters
      created_at_on: '',
      created_at_before: '',
      created_at_after: '',
      created_at_from: '',
      created_at_to: '',
      last_activity_on: '',
      last_activity_before: '',
      last_activity_after: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
              <p className="text-gray-600">Welcome back, {user?.first_name}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLeadDialog(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lead
              </button>
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Clear All
              </button>
              <button
                onClick={fetchLeads}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="text"
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                className="form-input"
                placeholder="Filter by email"
              />
            </div>
            <div>
              <label className="form-label">Company</label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                className="form-input"
                placeholder="Filter by company"
              />
            </div>
            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="form-input"
                placeholder="Filter by city"
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-input"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
                <option value="won">Won</option>
              </select>
            </div>
            <div>
              <label className="form-label">Source</label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="form-input"
              >
                <option value="">All Sources</option>
                <option value="website">Website</option>
                <option value="facebook_ads">Facebook Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Score Min</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.score_min}
                onChange={(e) => handleFilterChange('score_min', e.target.value)}
                className="form-input"
                placeholder="Min score"
              />
            </div>
            <div>
              <label className="form-label">Score Max</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.score_max}
                onChange={(e) => handleFilterChange('score_max', e.target.value)}
                className="form-input"
                placeholder="Max score"
              />
            </div>
            <div>
              <label className="form-label">Qualified</label>
              <select
                value={filters.is_qualified}
                onChange={(e) => handleFilterChange('is_qualified', e.target.value)}
                className="form-input"
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            
            {/* Date Filters */}
            <div>
              <label className="form-label">Created Date (On)</label>
              <input
                type="date"
                value={filters.created_at_on}
                onChange={(e) => handleFilterChange('created_at_on', e.target.value)}
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">Created Date (From)</label>
              <input
                type="date"
                value={filters.created_at_from}
                onChange={(e) => handleFilterChange('created_at_from', e.target.value)}
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">Created Date (To)</label>
              <input
                type="date"
                value={filters.created_at_to}
                onChange={(e) => handleFilterChange('created_at_to', e.target.value)}
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">Status (Multiple: new,qualified)</label>
              <input
                type="text"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-input"
                placeholder="Single: new or Multiple: new,qualified,won"
              />
            </div>
            
            <div>
              <label className="form-label">Source (Multiple: website,referral)</label>
              <input
                type="text"
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="form-input"
                placeholder="Single: website or Multiple: website,referral,events"
              />
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Leads ({pagination.total})
              </h2>
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </div>
            </div>
          </div>

          <div className="ag-theme-alpine w-full" style={{ height: '500px' }}>
            <ErrorBoundary>
              <AgGridReact
                columnDefs={columnDefs}
                rowData={leads}
                defaultColDef={defaultColDef}
                pagination={false}
                paginationPageSize={pagination.limit}
                domLayout="normal"
                loading={loading}
                suppressRowClickSelection={true}
                suppressCellFocus={true}
                suppressAnimationFrame={true}
                suppressBrowserResizeObserver={true}
              />
            </ErrorBoundary>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-200">
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border rounded-md"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md ${
                      page === pagination.page ? 'active' : ''
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 border rounded-md"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lead Dialog */}
      {showLeadDialog && (
        <LeadDialog
          isOpen={showLeadDialog}
          onClose={() => {
            setShowLeadDialog(false);
            setEditingLead(null);
          }}
          onSubmit={handleLeadSubmit}
          lead={editingLead}
        />
      )}
    </div>
  );
};

export default Dashboard;
