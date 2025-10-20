'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import SearchFilters from '../src/components/SearchFilters';
import AgentCard from '../src/components/AgentCard';
import Pagination from '../src/components/Pagination';
import MetaTags from '../src/components/MetaTags';
import { AgentList, AgentSearchResponse } from '../src/types';
import { apiClient } from '../src/lib/api';

export default function CatalogPage() {
  const [agents, setAgents] = useState<AgentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResponse, setSearchResponse] = useState<AgentSearchResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  const fetchAgents = useCallback(async (page: number = 1, searchFilters: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...searchFilters,
        page,
        limit: 12,
      };

      const response = await apiClient.searchAgents(params);
      setSearchResponse(response);
      setAgents(response.agents);
    } catch (err) {
      setError('Failed to load agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents(currentPage, filters);
  }, [fetchAgents, currentPage, filters]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <MetaTags
        title="Search AI Agents - Advanced Catalog with Filters"
        description={`Search and filter through ${searchResponse?.total || 'hundreds of'} verified AI agents. Find solutions by category, features, pricing, and ratings with advanced search tools.`}
        keywords="AI agents catalog, artificial intelligence search, category filters, chatbots, automation, machine learning"
        url="https://agentspool.ai/catalog"
        canonicalUrl="https://agentspool.ai/catalog"
      />

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Search AI Agents
            </h1>
            <p className="text-lg text-gray-600">
              Search and filter through {searchResponse?.total || 'many'} AI agents to find the perfect solution
            </p>
            <div className="mt-4">
              <a 
                href="/categories" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Browse by Categories
              </a>
            </div>
          </div>

          {/* Search and Filters */}
          <SearchFilters onFiltersChange={handleFiltersChange} />

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Loading Error
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => fetchAgents(currentPage, filters)}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Agents Found
              </h3>
              <p className="text-gray-600 mb-4">
                Try changing search parameters or reset filters
              </p>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-600">
                  Found {searchResponse?.total} agents
                </div>
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {searchResponse?.total_pages}
                </div>
              </div>

              {/* Agents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>

              {/* Pagination */}
              {searchResponse && searchResponse.total_pages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={searchResponse.total_pages}
                  totalItems={searchResponse.total}
                  itemsPerPage={searchResponse.limit}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
