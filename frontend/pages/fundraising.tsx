import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import MetaTags from '../src/components/MetaTags';

interface FundraisingCompany {
  company_name: string;
  crunchbase_url: string;
  description: string;
  funding_type: string;
  location: string;
  funding_amount: string;
  funding_currency: string;
  total_funding: string;
  total_funding_currency: string;
  lead_investor: string;
  website: string;
  news_count: number;
  news: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

export default function FundraisingPage() {
  const [companies, setCompanies] = useState<FundraisingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'name'>('date');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await fetch('/all_companies_merged.json');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string, currency: string = 'USD') => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num}`;
  };

  const extractDateFromNews = (company: FundraisingCompany): Date | null => {
    if (!company.news || company.news.length === 0) return null;
    
    // Try to extract date from first news snippet
    const firstNews = company.news[0];
    const dateMatch = firstNews.snippet.match(/([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})/);
    
    if (dateMatch) {
      const [, month, day, year] = dateMatch;
      const monthMap: Record<string, string> = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const monthNum = monthMap[month];
      if (monthNum) {
        return new Date(`${year}-${monthNum}-${day.padStart(2, '0')}`);
      }
    }
    return null;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays}d ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}mo ago`;
    }
    
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  const filteredCompanies = companies
    .filter(company => {
      const matchesSearch = !searchQuery || 
        company.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = !stageFilter || company.funding_type === stageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      if (sortBy === 'amount') {
        return parseFloat(b.funding_amount.replace(/,/g, '')) - parseFloat(a.funding_amount.replace(/,/g, ''));
      } else if (sortBy === 'date') {
        const dateA = extractDateFromNews(a);
        const dateB = extractDateFromNews(b);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.getTime() - dateA.getTime();
      } else if (sortBy === 'name') {
        return a.company_name.localeCompare(b.company_name);
      }
      return 0;
    });

  const totalFunding = companies.reduce((sum, company) => {
    return sum + parseFloat(company.funding_amount.replace(/,/g, ''));
  }, 0);

  const uniqueStages = Array.from(new Set(companies.map(c => c.funding_type))).filter(Boolean);

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
              Track the latest crypto VC investments and funding rounds in AI startups. 
              Our database covers {companies.length}+ companies with real-time updates.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-2">Total Funding</div>
              <div className="text-3xl font-bold text-blue-600">
                {formatAmount(totalFunding.toString())}
              </div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-2">Funding Rounds</div>
              <div className="text-3xl font-bold text-green-600">
                {companies.length}
              </div>
              <div className="text-xs text-red-600 mt-1">-7.75%</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-2">Average Round Size</div>
              <div className="text-3xl font-bold text-purple-600">
                {formatAmount((totalFunding / companies.length).toString())}
              </div>
              <div className="text-xs text-gray-500 mt-1">$3-10M range</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Stage Filter */}
              <div>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Stages</option>
                  {uniqueStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSortBy('date')}
                className={`px-4 py-2 rounded-lg text-sm ${
                  sortBy === 'date' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sort by Date
              </button>
              <button
                onClick={() => setSortBy('amount')}
                className={`px-4 py-2 rounded-lg text-sm ${
                  sortBy === 'amount' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sort by Amount
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-2 rounded-lg text-sm ${
                  sortBy === 'name' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sort by Name
              </button>
            </div>
          </div>

          {/* Companies Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Raise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Funding
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies.map((company, index) => (
                      <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {company.company_name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {company.company_name}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {company.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {company.funding_type || 'Undisclosed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatAmount(company.funding_amount, company.funding_currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatAmount(company.total_funding, company.total_funding_currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(extractDateFromNews(company))}
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

