import { useState, useEffect } from 'react';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import MetaTags from '../src/components/MetaTags';

interface FundraisingCompany {
  id: number;
  name: string;
  canonical_name?: string;
  website?: string;
  last_funding_date?: string;
  funding_summary?: any;
  profile?: {
    ap_description?: string;
    [key: string]: any;
  };
  social_links?: any;
  metrics?: any;
  news?: any[];
  extra_data?: {
    crunchbase_url?: string;
    [key: string]: any;
  };
  created_at?: string;
}

export default function FundraisingPage() {
  const [companies, setCompanies] = useState<FundraisingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/v1/fundraising?limit=1000');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const filteredCompanies = companies.filter(company => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(search) ||
      company.canonical_name?.toLowerCase().includes(search) ||
      company.profile?.ap_description?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <MetaTags
        title="AI Fundraising Tracker - Latest AI Startup Investments"
        description="Track the latest funding rounds and investments in AI startups. View fundraising data, investors, and valuations for top artificial intelligence companies."
        keywords="AI fundraising, AI investments, AI startup funding, venture capital, AI companies"
        url="https://agentspool.ai/fundraising"
      />
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Fundraising Tracker
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track the latest investments and funding rounds in AI startups. 
              Our database covers {companies.length}+ companies with real-time updates.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-2">Total Companies</div>
              <div className="text-3xl font-bold text-blue-600">
                {companies.length}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-2">With Funding Data</div>
              <div className="text-3xl font-bold text-green-600">
                {companies.filter(c => c.funding_summary).length}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-2">Latest Update</div>
              <div className="text-xl font-bold text-purple-600">
                {companies.length > 0 ? formatDate(companies[0].created_at) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies by name or description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Companies Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No companies found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Funding
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Links
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {company.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {company.name}
                              </div>
                              {company.canonical_name && (
                                <div className="text-xs text-gray-500">
                                  {company.canonical_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 line-clamp-2">
                            {company.profile?.ap_description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(company.last_funding_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            {company.website && (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Website
                              </a>
                            )}
                            {company.extra_data?.crunchbase_url && (
                              <a
                                href={company.extra_data.crunchbase_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Crunchbase
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="text-center text-sm text-gray-600 mt-6">
            Showing {filteredCompanies.length} of {companies.length} companies
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
