import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MetaTags from '../src/components/MetaTags';
import AdminAuth from '../src/components/AdminAuth';

interface Agent {
  id: number;
  name: string;
  description: string;
  short_description: string;
  author: string;
  featured: boolean;
  slug: string;
  tags: string[];
  capabilities: string[];
  use_cases: string[];
  url: string;
  documentation_url: string;
  github_url: string;
  website_url: string;
  api_endpoint: string;
  a2a?: string;
  img_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  useEffect(() => {
    loadAgents();
    loadCategories();
  }, [currentPage, searchQuery, categoryFilter]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (searchQuery) params.append('q', searchQuery);
      if (categoryFilter) params.append('category_id', categoryFilter.toString());
      
      const response = await fetch(`${API_BASE_URL}/api/v1/agents?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load agents');
      }
      
      const data = await response.json();
      setAgents(data.agents || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
      setError(null);
    } catch (err) {
      console.error('Error loading agents:', err);
      setError('Failed to load agents from database');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';
      const response = await fetch(`${API_BASE_URL}/api/v1/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteAgent = async (agentId: number) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';
      const response = await fetch(`${API_BASE_URL}/api/v1/agents/${agentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }
      
      showNotification('✅ Agent deleted successfully');
      loadAgents();
    } catch (err) {
      console.error('Error deleting agent:', err);
      alert('Failed to delete agent');
    }
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';
      const response = await fetch(`${API_BASE_URL}/api/v1/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !agent.is_active }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update agent');
      }
      
      showNotification(`✅ Agent ${!agent.is_active ? 'activated' : 'deactivated'}`);
      loadAgents();
    } catch (err) {
      console.error('Error updating agent:', err);
      alert('Failed to update agent');
    }
  };

  const handleToggleFeatured = async (agent: Agent) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';
      const response = await fetch(`${API_BASE_URL}/api/v1/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !agent.featured }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update agent');
      }
      
      showNotification(`✅ Agent ${!agent.featured ? 'featured' : 'unfeatured'}`);
      loadAgents();
    } catch (err) {
      console.error('Error updating agent:', err);
      alert('Failed to update agent');
    }
  };

  if (loading && agents.length === 0) {
    return (
      <AdminAuth>
        <MetaTags title="Admin - Loading..." noIndex={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agents from database...</p>
          </div>
        </div>
      </AdminAuth>
    );
  }

  return (
    <AdminAuth>
      <MetaTags title="Admin - Agent Management" noIndex={true} />
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {notification}
        </div>
      )}
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
                <p className="text-gray-600">Total: {total} agents</p>
              </div>
              <button
                onClick={() => router.push('/add-agent')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add New Agent
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name, author, description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter || ''}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value ? parseInt(e.target.value) : null);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">❌</span>
                <span className="text-red-800">{error}</span>
                <button
                  onClick={loadAgents}
                  className="ml-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Agents Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No agents found
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                            <div className="text-sm text-gray-500">{agent.short_description?.substring(0, 60)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{agent.author}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {agent.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {agent.featured && (
                            <span className="inline-flex ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <a
                          href={`/agents/${agent.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleToggleActive(agent)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {agent.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(agent)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          {agent.featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminAuth>
  );
}
