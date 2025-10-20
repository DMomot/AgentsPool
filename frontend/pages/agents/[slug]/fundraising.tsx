import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Header from '../../../src/components/Header';
import Footer from '../../../src/components/Footer';
import MetaTags from '../../../src/components/MetaTags';
import Link from 'next/link';

interface Agent {
  id: number;
  name: string;
  description: string;
  short_description: string;
  author: string;
  slug: string;
  website_url: string;
}

interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  date?: string;
}

interface FundraisingData {
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
  news: NewsItem[];
  _raw_data?: {
    'Last Funding Date'?: string;
    'Founded Date'?: string;
    'Industries'?: string;
    'Full Description'?: string;
    [key: string]: any;
  };
}

interface PageProps {
  agent: Agent | null;
  fundraising: FundraisingData | null;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const { slug } = context.params as { slug: string };

  try {
    // Fetch agent data
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';
    const agentResponse = await fetch(`${apiUrl}/api/v1/agents/slug/${slug}`);
    
    if (!agentResponse.ok) {
      return {
        notFound: true,
      };
    }

    const agent = await agentResponse.json();

    // Load fundraising data from JSON
    const fs = require('fs');
    const path = require('path');
    const fundraisingPath = path.join(process.cwd(), 'public', 'all_companies_merged.json');
    
    let fundraising = null;
    if (fs.existsSync(fundraisingPath)) {
      const fundraisingData = JSON.parse(fs.readFileSync(fundraisingPath, 'utf8'));
      // Try to match by agent name or website
      fundraising = fundraisingData.find((company: FundraisingData) => 
        company.company_name.toLowerCase() === agent.name.toLowerCase() ||
        (agent.website_url && company.website.toLowerCase().includes(agent.website_url.toLowerCase().replace(/https?:\/\/(www\.)?/, '')))
      );
    }

    return {
      props: {
        agent,
        fundraising,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        agent: null,
        fundraising: null,
        error: 'Failed to load data',
      },
    };
  }
};

export default function AgentFundraisingPage({ agent, fundraising, error }: PageProps) {
  const router = useRouter();

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error || 'Agent not found'}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatAmount = (amount: string, currency: string = 'USD') => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num}`;
  };

  const extractDateFromNews = (fundraising: FundraisingData | null): Date | null => {
    if (!fundraising) return null;
    
    // First try to get date from _raw_data
    if (fundraising._raw_data?.['Last Funding Date']) {
      const date = new Date(fundraising._raw_data['Last Funding Date']);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Fallback: try to extract date from first news snippet
    if (!fundraising.news || fundraising.news.length === 0) return null;
    
    const firstNews = fundraising.news[0];
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
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <>
      <MetaTags
        title={`${agent.name} Fundraising - Investment & Funding Rounds`}
        description={`View funding rounds, investors, and valuation history for ${agent.name}. ${fundraising ? `Latest round: ${fundraising.funding_type} - ${formatAmount(fundraising.funding_amount)}` : 'No funding data available.'}`}
        keywords={`${agent.name}, fundraising, investment, funding rounds, venture capital, AI startup`}
        url={`https://agentspool.ai/agents/${agent.slug}/fundraising`}
        canonicalUrl={`https://agentspool.ai/agents/${agent.slug}/fundraising`}
        type="article"
      />
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href="/agents" className="text-gray-700 hover:text-blue-600">
                    Agents
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href={`/agents/${agent.slug}`} className="text-gray-700 hover:text-blue-600">
                    {agent.name}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Fundraising</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-2xl">{agent.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{agent.name}</h1>
                  <p className="text-gray-600">{agent.description}</p>
                </div>
              </div>
              <Link
                href={`/agents/${agent.slug}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                View Agent
              </Link>
            </div>
          </div>

          {fundraising ? (
            <>
              {/* Fundraising Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Latest Round</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatAmount(fundraising.funding_amount, fundraising.funding_currency)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{fundraising.funding_type}</div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Total Funding</div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatAmount(fundraising.total_funding, fundraising.total_funding_currency)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">All rounds</div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Announced Date</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatDate(extractDateFromNews(fundraising))}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Latest round</div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Lead Investor</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {fundraising.lead_investor || 'Not disclosed'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{fundraising.funding_type}</div>
                </div>
              </div>

              {/* Company Details */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Location</div>
                    <div className="text-gray-900">{fundraising.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Website</div>
                    <a 
                      href={fundraising.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {fundraising.website}
                    </a>
                  </div>
                  {fundraising.crunchbase_url && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Crunchbase</div>
                      <a 
                        href={fundraising.crunchbase_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* News & Updates */}
              {fundraising.news && fundraising.news.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Recent News ({fundraising.news_count})
                  </h2>
                  <div className="space-y-4">
                    {fundraising.news.map((item, index) => (
                      <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <a 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded"
                        >
                          <h3 className="text-blue-600 hover:text-blue-800 font-medium mb-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.snippet}
                          </p>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">💼</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No Fundraising Data Available
              </h2>
              <p className="text-gray-600 mb-6">
                We don't have fundraising information for {agent.name} yet.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Check back later or visit their official website for more information.
                </p>
                {agent.website_url && (
                  <a
                    href={agent.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Visit Official Website
                  </a>
                )}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}

