import { useState, useEffect } from 'react';
import { useTranslation } from '../src/hooks/useTranslation';
import MetaTags from '../src/components/MetaTags';
import AdminAuth from '../src/components/AdminAuth';
import OpenRouterAssistant from '../src/components/OpenRouterAssistant';

interface AgentData {
  url: string;
  title: string;
  description: string;
  h1_headings?: string[];
  h2_headings?: string[];
  h3_headings?: string[];
  main_text: string;
  keywords?: string[];
  category?: string;
}

interface AgentsFile {
  metadata: any;
  stats: any;
  agents_content: AgentData[];
}

export default function AdminPage() {
  const { t } = useTranslation();
  const [agentsData, setAgentsData] = useState<AgentsFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Security: Prevent direct access via common admin URLs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/admin') && path !== '/_internal_moderation') {
        window.location.href = '/';
      }
    }
  }, []);
  
  // Editable fields
  const [editedAgent, setEditedAgent] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  // OpenRouter reset function
  const [openRouterResetTrigger, setOpenRouterResetTrigger] = useState(0);
  
  // Skip duplicates
  const [skippedAgents, setSkippedAgents] = useState<string[]>([]);
  
  // Auto-import state
  const [autoImporting, setAutoImporting] = useState(false);
  const [autoImportResults, setAutoImportResults] = useState<any>(null);

  useEffect(() => {
    loadAgentsData();
    loadCategories();
  }, []);

  // Auto-skip duplicates when data loads or index changes
  useEffect(() => {
    const checkAndSkipDuplicates = async () => {
      console.log(`🚀 useEffect triggered - agentsData: ${!!agentsData}, loading: ${loading}, currentIndex: ${currentIndex}`);
      
      if (agentsData && currentIndex < agentsData.agents_content.length) {
        console.log(`🔄 Starting duplicate check from index ${currentIndex}`);
        const nextIndex = await findNextAvailableAgent(currentIndex);
        console.log(`📍 Next available index: ${nextIndex}, current: ${currentIndex}`);
        
        if (nextIndex !== currentIndex) {
          console.log(`⏭️ Moving from index ${currentIndex} to ${nextIndex}`);
          setCurrentIndex(nextIndex);
        } else {
          console.log(`✅ Current agent at index ${currentIndex} is available`);
        }
      } else {
        console.log(`⏸️ Skipping check - no data or reached end`);
      }
    };

    if (agentsData && !loading) {
      console.log(`🎯 Conditions met, running duplicate check`);
      checkAndSkipDuplicates();
    } else {
      console.log(`⏸️ Conditions not met - agentsData: ${!!agentsData}, loading: ${loading}`);
    }
  }, [agentsData, loading]);

  useEffect(() => {
    // Initialize edited agent when current agent changes
    if (currentAgent) {
      initializeEditedAgent(currentAgent);
    }
  }, [currentIndex, agentsData]);

  const loadAgentsData = async () => {
    try {
      setLoading(true);
      // Load the JSON file
      const response = await fetch('/complete_agents_content_analysis_updated.json');
      if (!response.ok) {
        throw new Error('Failed to load agents data');
      }
      const data = await response.json();
      setAgentsData(data);
    } catch (err) {
      console.error('Error loading agents data:', err);
      setError('Failed to load agents data');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      // Use default categories if API fails
      setCategories([
        { id: 1, name: 'Content & Media' },
        { id: 2, name: 'Business & Productivity' },
        { id: 3, name: 'Development & Coding' },
        { id: 4, name: 'AI Platforms & Infrastructure' },
        { id: 5, name: 'Marketing & Sales' },
        { id: 6, name: 'Personal & Lifestyle' },
        { id: 7, name: 'Customer Support & HR' },
        { id: 8, name: 'Specialized Industries' },
        { id: 9, name: 'Web & Mobile' },
        { id: 10, name: 'LLM & AI Assistants' },
        { id: 11, name: 'Blockchain & Web3' },
        { id: 12, name: 'Workflow' },
        { id: 13, name: 'Security & Infrastructure' },
        { id: 14, name: 'Other & Miscellaneous' }
      ]);
    }
  };

  const checkAgentExists = async (url: string): Promise<boolean> => {
    try {
      console.log(`🔍 Checking if agent exists: ${url}`);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/agents/check-url?url=${encodeURIComponent(url)}`);
      console.log(`📡 API Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 API Response data:`, data);
        
        if (data.exists) {
          console.log(`❌ Agent already exists: ${data.agent_name} (ID: ${data.agent_id})`);
          
          // Remove duplicate agent from JSON file to speed up future checks
          console.log(`🗑️ Removing duplicate agent from JSON: ${url}`);
          console.log(`🌐 Using API URL: ${API_BASE_URL}`);
          try {
            // Use Next.js API route for JSON manipulation (works in both dev and prod)
            const removeResponse = await fetch(`/api/remove-from-json?url=${encodeURIComponent(url)}`, {
              method: 'DELETE',
            });
            
            console.log(`📡 Remove response status: ${removeResponse.status}`);
            
            if (removeResponse.ok) {
              const removeResult = await removeResponse.json();
              console.log('✅ Duplicate agent removed from JSON:', removeResult.message);
              console.log(`📊 Remaining agents in JSON: ${removeResult.remaining_count}`);
            } else {
              const errorText = await removeResponse.text();
              console.warn('⚠️ Failed to remove duplicate agent from JSON file:', errorText);
            }
          } catch (removeError) {
            console.warn('⚠️ Error removing duplicate agent from JSON:', removeError);
          }
          
          return true;
        } else {
          console.log(`✅ Agent is new, can be added`);
          return false;
        }
      }
      console.log(`⚠️ API request failed with status: ${response.status}`);
      return false;
    } catch (error) {
      console.error('❌ Error checking agent existence:', error);
      return false; // Continue if check fails
    }
  };

  const findNextAvailableAgent = async (startIndex: number): Promise<number> => {
    console.log(`🔄 Finding next available agent starting from index: ${startIndex}`);
    
    if (!agentsData) {
      console.log(`❌ No agents data available`);
      return startIndex;
    }
    
    for (let i = startIndex; i < agentsData.agents_content.length; i++) {
      const agent = agentsData.agents_content[i];
      console.log(`🔍 Checking agent ${i}: ${agent.title} (${agent.url})`);
      
      const exists = await checkAgentExists(agent.url);
      
      if (!exists) {
        console.log(`✅ Found available agent at index ${i}: ${agent.title}`);
        return i; // Found available agent
      } else {
        console.log(`⏭️ Skipping agent ${i}: ${agent.title} - already exists`);
        // Mark as skipped
        setSkippedAgents(prev => [...prev, agent.url]);
        setNotification(`⏭️ Skipping "${agent.title}" - already exists in database`);
        setTimeout(() => setNotification(null), 2000);
      }
    }
    
    console.log(`🏁 No more agents available after index ${startIndex}`);
    return agentsData.agents_content.length; // No more agents
  };

  const initializeEditedAgent = (agent: AgentData) => {
    const domain = new URL(agent.url).hostname.replace('www.', '');
    const agentName = agent.title.length > 100 
      ? domain.charAt(0).toUpperCase() + domain.slice(1)
      : agent.title;

    setEditedAgent({
      name: agentName,
      description: agent.description || agent.main_text || 'AI agent',
      short_description: (agent.description || agent.main_text || '').substring(0, 200),
      category_id: getCategoryId(agent.category),
      author: domain,
      version: '1.0.0',
      price: 0.0,
      pricing_model: 'free',
      is_free: true,
      tags: agent.keywords?.slice(0, 10) || [],
      capabilities: extractCapabilities(agent),
      use_cases: extractUseCases(agent),
      demo_url: agent.url,
      documentation_url: agent.url,
      github_url: agent.url,
      website_url: agent.url,
      api_endpoint: null
    });
  };

  const currentAgent = agentsData?.agents_content[currentIndex];

  const handleApprove = async () => {
    if (!editedAgent || !currentAgent) return;
    
    setProcessing(true);
    try {
      const domain = new URL(currentAgent.url).hostname.replace('www.', '');
      
      // Use edited agent data
      const agentData = {
        ...editedAgent,
        contact_email: "", // Optional field - empty string if not provided
        logo_url: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        screenshots: []
      };

      // Send to API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`Failed to add agent (${response.status}): ${errorData}`);
      }

      // Show success notification
      setNotification(`✅ Agent "${editedAgent.name}" successfully added!`);
      setTimeout(() => setNotification(null), 3000);

      // Reset OpenRouter suggestions
      setOpenRouterResetTrigger(prev => prev + 1);

      // Remove agent from JSON file to speed up future checks
      try {
        console.log('🗑️ Removing agent from JSON file...');
        const removeResponse = await fetch(`/api/remove-from-json?url=${encodeURIComponent(currentAgent.url)}`, {
          method: 'DELETE',
        });
        
        if (removeResponse.ok) {
          const removeResult = await removeResponse.json();
          console.log('✅ Agent removed from JSON:', removeResult.message);
          console.log(`📊 Remaining agents in JSON: ${removeResult.remaining_count}`);
        } else {
          console.warn('⚠️ Failed to remove agent from JSON file');
        }
      } catch (removeError) {
        console.warn('⚠️ Error removing agent from JSON:', removeError);
      }

      // Find next available agent
      const nextIndex = await findNextAvailableAgent(currentIndex + 1);
      setCurrentIndex(nextIndex);
      
    } catch (err) {
      console.error('Error adding agent:', err);
      alert('Failed to add agent: ' + (err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSkip = async () => {
    // Find next available agent
    const nextIndex = await findNextAvailableAgent(currentIndex + 1);
    setCurrentIndex(nextIndex);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleAutoImport = async () => {
    if (autoImporting) return;
    
    const maxAgents = parseInt(prompt('How many agents to import? (max 50)', '10') || '10');
    if (maxAgents <= 0 || maxAgents > 50) {
      alert('Please enter a number between 1 and 50');
      return;
    }
    
    if (!confirm(`Start auto-import of ${maxAgents} agents? This will:\n\n• Parse each website\n• Generate AI recommendations\n• Automatically add to database\n• Skip existing agents\n\nThis may take several minutes.`)) {
      return;
    }
    
    setAutoImporting(true);
    setAutoImportResults(null);
    
    try {
      console.log(`🚀 Starting auto-import of ${maxAgents} agents...`);
      
      const response = await fetch('/api/v1/auto-import-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_agents: maxAgents,
          skip_existing: true
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Auto-import failed');
      }
      
      const result = await response.json();
      setAutoImportResults(result.results);
      
      alert(`🎉 Auto-import completed!\n\n✅ ${result.results.successful_imports} agents imported\n⏭️ ${result.results.skipped_existing} duplicates skipped\n❌ ${result.results.failed_imports} failed\n\nCheck console for detailed logs.`);
      
      console.log('🎉 Auto-import results:', result.results);
      
      // Reload agents data to reflect new additions
      await loadAgentsData();
      
    } catch (error: any) {
      console.error('❌ Auto-import error:', error);
      alert('Auto-import failed: ' + error.message);
    } finally {
      setAutoImporting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    let processedValue = value;
    
    // Auto-process name to be 1-2 words
    if (field === 'name' && typeof value === 'string') {
      // Remove extra whitespace and split into words
      const words = value.trim().split(/\s+/);
      // Take only first 1-2 words
      processedValue = words.slice(0, 2).join(' ');
    }
    
    setEditedAgent((prev: any) => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !editedAgent?.tags?.includes(tag.trim())) {
      updateField('tags', [...(editedAgent?.tags || []), tag.trim()]);
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...(editedAgent?.tags || [])];
    newTags.splice(index, 1);
    updateField('tags', newTags);
  };

  const addCapability = (capability: string) => {
    if (capability.trim() && !editedAgent?.capabilities?.includes(capability.trim())) {
      updateField('capabilities', [...(editedAgent?.capabilities || []), capability.trim()]);
    }
  };

  const removeCapability = (index: number) => {
    const newCapabilities = [...(editedAgent?.capabilities || [])];
    newCapabilities.splice(index, 1);
    updateField('capabilities', newCapabilities);
  };

  const getCategoryId = (category?: string): number => {
    // Map categories to IDs based on your new categories
    const categoryMap: Record<string, number> = {
      'Content & Media': 1,
      'Business & Productivity': 2,
      'Development & Coding': 3,
      'AI Platforms & Infrastructure': 4,
      'Marketing & Sales': 5,
      'Personal & Lifestyle': 6,
      'Customer Support & HR': 7,
      'Specialized Industries': 8,
      'Web & Mobile': 9,
      'LLM & AI Assistants': 10,
      'Blockchain & Web3': 11,
      'Workflow': 12,
      'Security & Infrastructure': 13,
      'Other & Miscellaneous': 14,
    };
    
    return categoryMap[category || 'Other & Miscellaneous'] || 14;
  };

  const extractCapabilities = (agent: AgentData): string[] => {
    const capabilities: string[] = [];
    
    // Extract from headings
    agent.h2_headings?.forEach(heading => {
      if (heading.length < 100) capabilities.push(heading);
    });
    
    agent.h3_headings?.forEach(heading => {
      if (heading.length < 100) capabilities.push(heading);
    });
    
    return capabilities.slice(0, 5);
  };

  const extractUseCases = (agent: AgentData): string[] => {
    const useCases: string[] = [];
    
    // Basic use cases based on keywords
    if (agent.keywords?.includes('automation')) useCases.push('Process automation');
    if (agent.keywords?.includes('AI') || agent.keywords?.includes('GPT')) useCases.push('AI assistance');
    if (agent.keywords?.includes('chat')) useCases.push('Customer support');
    if (agent.keywords?.includes('content')) useCases.push('Content creation');
    if (agent.keywords?.includes('data')) useCases.push('Data analysis');
    
    return useCases.length > 0 ? useCases : ['General AI assistance'];
  };

  if (loading) {
    return (
      <AdminAuth>
        <MetaTags title="Admin - Loading..." noIndex={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agents data...</p>
          </div>
        </div>
      </AdminAuth>
    );
  }

  if (error) {
    return (
      <AdminAuth>
        <MetaTags title="Admin - Error" noIndex={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">❌</div>
            <p className="text-gray-900 font-medium mb-2">Error</p>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={loadAgentsData}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminAuth>
    );
  }

  if (!agentsData || currentIndex >= agentsData.agents_content.length) {
    return (
      <AdminAuth>
        <MetaTags title="Admin - Complete" noIndex={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-green-600 mb-4 text-4xl">🎉</div>
            <p className="text-gray-900 font-medium mb-2">All agents reviewed!</p>
            <p className="text-gray-600">You've gone through all {agentsData?.agents_content.length} agents.</p>
          </div>
        </div>
      </AdminAuth>
    );
  }

  return (
    <AdminAuth>
      <MetaTags title="Admin - Agent Moderation" noIndex={true} />
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {notification}
        </div>
      )}
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agent Moderation</h1>
                <p className="text-gray-600">
                  Agent {currentIndex + 1} of {agentsData.agents_content.length}
                </p>
                {skippedAgents.length > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⏭️ {skippedAgents.length} duplicates skipped
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAutoImport}
                  disabled={autoImporting}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    autoImporting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {autoImporting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Auto-importing...
                    </span>
                  ) : (
                    '🚀 Auto-Import'
                  )}
                </button>
                <div className="text-sm text-gray-500">
                  Progress: {Math.round(((currentIndex + 1) / agentsData.agents_content.length) * 100)}%
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / agentsData.agents_content.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Auto-import results */}
        {autoImportResults && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Auto-Import Completed</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>✅ {autoImportResults.successful_imports} agents imported successfully</p>
                  <p>⏭️ {autoImportResults.skipped_existing} duplicates skipped</p>
                  {autoImportResults.failed_imports > 0 && (
                    <p>❌ {autoImportResults.failed_imports} failed imports</p>
                  )}
                  <p className="mt-2 font-medium">Total processed: {autoImportResults.total_processed}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setAutoImportResults(null)}
                    className="text-sm text-green-600 hover:text-green-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentAgent && editedAgent && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Agent editing form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left column - Original data */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Data</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${new URL(currentAgent.url).hostname}&sz=64`}
                        alt="Logo"
                        className="w-16 h-16 rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzNCODJGNiIvPgo8dGV4dCB4PSIzMiIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkE8L3RleHQ+Cjwvc3ZnPg==';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{currentAgent.title}</h4>
                        <a 
                          href={currentAgent.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 block"
                        >
                          {new URL(currentAgent.url).hostname}
                        </a>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Description</label>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                        {currentAgent.description || currentAgent.main_text}
                      </div>
                    </div>
                    
                    {currentAgent.keywords && currentAgent.keywords.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Original Keywords</label>
                        <div className="flex flex-wrap gap-1">
                          {currentAgent.keywords.slice(0, 10).map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right column - Editable form */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Agent Data</h3>
                  <div className="space-y-4">
                    {/* Agent Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                      <input
                        type="text"
                        value={editedAgent.name || ''}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g. SimplAI, ChatGPT, Claude..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep it short: 1-2 words maximum. Longer names will be automatically trimmed.
                      </p>
                    </div>

                    {/* Short Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                      <input
                        type="text"
                        value={editedAgent.short_description || ''}
                        onChange={(e) => updateField('short_description', e.target.value)}
                        maxLength={200}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {(editedAgent.short_description || '').length}/200 characters
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={editedAgent.category_id || ''}
                        onChange={(e) => updateField('category_id', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description - Editable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editedAgent.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        rows={4}
                        placeholder="Enter agent description..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Main description for the agent - can be improved for better marketing appeal</p>
                    </div>

                    {/* Author */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <input
                        type="text"
                        value={editedAgent.author || ''}
                        onChange={(e) => updateField('author', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editedAgent.tags?.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="ml-1 text-primary-500 hover:text-primary-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Add tag..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addTag(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            addTag(input.value);
                            input.value = '';
                          }}
                          className="px-3 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* URLs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
                      <input
                        type="url"
                        value={editedAgent.demo_url || ''}
                        onChange={(e) => updateField('demo_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Documentation URL</label>
                      <input
                        type="url"
                        value={editedAgent.documentation_url || ''}
                        onChange={(e) => updateField('documentation_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Capabilities */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capabilities</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editedAgent.capabilities?.map((capability: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                          >
                            {capability}
                            <button
                              type="button"
                              onClick={() => removeCapability(index)}
                              className="ml-1 text-green-500 hover:text-green-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Add capability..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addCapability(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            addCapability(input.value);
                            input.value = '';
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OpenRouter AI Assistant */}
              <div className="mt-8">
                <OpenRouterAssistant
                  key={openRouterResetTrigger} // Force re-render to reset state
                  agentData={currentAgent}
                  editedAgent={editedAgent}
                  onSuggestionApply={updateField}
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSkip}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Adding...' : '✓ Approve & Add'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminAuth>
  );
}
