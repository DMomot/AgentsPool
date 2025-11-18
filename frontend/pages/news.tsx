import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import MetaTags from '../src/components/MetaTags';
import Pagination from '../src/components/Pagination';
import { apiClient } from '../src/lib/api';
import { NewsArticle } from '../src/types';

interface NewsPageProps {
  articles: NewsArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  companies: string[];
  newsTypes: string[];
  technologies: string[];
  sources: Array<{ name: string; domain: string }>;
  selectedCompany?: string;
  selectedNewsType?: string;
  selectedTechnology?: string;
  selectedSource?: string;
  searchQuery?: string;
}

export default function NewsPage({
  articles,
  total,
  page,
  limit,
  totalPages,
  hasNext,
  hasPrev,
  companies,
  newsTypes,
  technologies,
  sources,
  selectedCompany,
  selectedNewsType,
  selectedTechnology,
  selectedSource,
  searchQuery,
}: NewsPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  useEffect(() => {
    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);
    const handleRouteChangeError = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  const handleFilterChange = (filterType: 'company' | 'news' | 'tech' | 'source', value: string) => {
    const query: any = { page: '1' };
    
    if (filterType === 'company') {
      if (value) query.company = value;
      if (selectedNewsType) query.news = selectedNewsType;
      if (selectedTechnology) query.tech = selectedTechnology;
      if (selectedSource) query.source = selectedSource;
    } else if (filterType === 'news') {
      if (value) query.news = value;
      if (selectedCompany) query.company = selectedCompany;
      if (selectedTechnology) query.tech = selectedTechnology;
      if (selectedSource) query.source = selectedSource;
    } else if (filterType === 'tech') {
      if (value) query.tech = value;
      if (selectedCompany) query.company = selectedCompany;
      if (selectedNewsType) query.news = selectedNewsType;
      if (selectedSource) query.source = selectedSource;
    } else {
      if (value) query.source = value;
      if (selectedCompany) query.company = selectedCompany;
      if (selectedNewsType) query.news = selectedNewsType;
      if (selectedTechnology) query.tech = selectedTechnology;
    }
    
    router.push({
      pathname: '/news',
      query,
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push('/news');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query: any = { page: '1' };
    if (searchInput.trim()) query.search = searchInput.trim();
    if (selectedCompany) query.company = selectedCompany;
    if (selectedNewsType) query.news = selectedNewsType;
    if (selectedTechnology) query.tech = selectedTechnology;
    if (selectedSource) query.source = selectedSource;
    
    router.push({
      pathname: '/news',
      query,
    });
  };

  const handlePageChange = (newPage: number) => {
    const query: any = { page: newPage.toString() };
    if (searchInput.trim()) query.search = searchInput.trim();
    if (selectedCompany) query.company = selectedCompany;
    if (selectedNewsType) query.news = selectedNewsType;
    if (selectedTechnology) query.tech = selectedTechnology;
    if (selectedSource) query.source = selectedSource;
    
    router.push({
      pathname: '/news',
      query,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const decodeHtmlEntities = (text: string) => {
    return text
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#8216;/g, '\u2018')
      .replace(/&#8217;/g, '\u2019')
      .replace(/&#8220;/g, '\u201C')
      .replace(/&#8221;/g, '\u201D')
      .replace(/&#8230;/g, '\u2026');
  };

  return (
    <>
      <MetaTags
        title="AI & Agent News - Latest Updates and Developments"
        description={`Stay updated with the latest news about AI agents, artificial intelligence, and emerging technologies. Browse ${total} news articles.`}
        keywords="AI news, agent news, artificial intelligence updates, technology news"
        url="https://agentspool.ai/news"
        canonicalUrl="https://agentspool.ai/news"
      />

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI & Agent News
            </h1>
            <p className="text-lg text-gray-600">
              Latest updates and developments in AI agents
            </p>
          </div>

          {/* Search Input */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search news by title or description (e.g., OpenAI, ChatGPT, AI agents)..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Companies Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Companies
                </label>
                <select
                  value={selectedCompany || ''}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {/* News Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  News
                </label>
                <select
                  value={selectedNewsType || ''}
                  onChange={(e) => handleFilterChange('news', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All News Types</option>
                  {newsTypes.map((newsType) => (
                    <option key={newsType} value={newsType}>
                      {newsType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Technology Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technology
                </label>
                <select
                  value={selectedTechnology || ''}
                  onChange={(e) => handleFilterChange('tech', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Technologies</option>
                  {technologies.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sources Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sources
                </label>
                <select
                  value={selectedSource || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Sources</option>
                  {sources.map((source) => (
                    <option key={source.name} value={source.name}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(searchInput || selectedCompany || selectedNewsType || selectedTechnology || selectedSource) && (
              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center mb-8">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading news...</p>
              </div>
            </div>
          )}

          {/* News Articles */}
          <div className={`space-y-6 mb-8 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {articles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600">No news articles found.</p>
              </div>
            ) : (
              articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="flex-shrink-0 w-[500px] h-[350px]">
                      <img
                        src={article.img_url || '/agents_pool.webp'}
                        alt={decodeHtmlEntities(article.title)}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/agents_pool.webp';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <Link
                          href={`/news/${article.id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {decodeHtmlEntities(article.title)}
                        </Link>
                      </div>

                      {article.description && (
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {decodeHtmlEntities(article.description)}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium text-blue-600">
                          {article.source_name}
                        </span>
                        <span>•</span>
                        <time>{formatDate(article.published_at)}</time>
                      </div>

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.tags
                            .map((tag) => {
                              // Parse format: Category|TagName|Weight
                              const parts = tag.split('|');
                              if (parts.length === 3) {
                                const tagName = parts[1];
                                return tagName;
                              }
                              return null;
                            })
                            .filter((tagName) => tagName !== null)
                            .map((tagName, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                              >
                                {tagName}
                              </span>
                            ))}
                        </div>
                      )}

                      <div>
                        <Link
                          href={`/news/${article.id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Read More
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />
          )}

          {/* Stats */}
          <div className="text-center mt-8 text-sm text-gray-600">
            Showing {articles.length} of {total} articles
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { page = '1', company, news, tech, source, search } = context.query;
    const pageNum = parseInt(page as string, 10);

    // Build tag filter - combine all selected filters
    let tagFilter = '';
    const filters = [];
    if (company) filters.push(`Firm|${company}`);
    if (news) filters.push(`News|${news}`);
    if (tech) filters.push(`Tech|${tech}`);
    
    if (filters.length > 0) {
      tagFilter = filters[0]; // Use first filter (backend will add |% for LIKE search)
    }

    // Fetch news articles
    const newsResponse = await apiClient.getNews({
      page: pageNum,
      limit: 20,
      tag: tagFilter || undefined,
      source: source as string || undefined,
      search: search as string || undefined,
    });

    // Fetch tags and sources for filters
    const [tags, sources] = await Promise.all([
      apiClient.getNewsTags(),
      apiClient.getNewsSources(),
    ]);
    
    // Parse and categorize tags: Format is "Category|TagName|Weight"
    const companiesSet = new Set<string>();
    const newsTypesSet = new Set<string>();
    const technologiesSet = new Set<string>();
    
    tags.forEach((tag: string) => {
      const parts = tag.split('|');
      if (parts.length === 3) {
        const category = parts[0];
        const tagName = parts[1];
        
        if (category === 'Firm') {
          companiesSet.add(tagName);
        } else if (category === 'News') {
          newsTypesSet.add(tagName);
        } else if (category === 'Tech') {
          technologiesSet.add(tagName);
        }
      }
    });

    // Convert sets to sorted arrays
    const companies = Array.from(companiesSet).sort();
    const newsTypes = Array.from(newsTypesSet).sort();
    const technologies = Array.from(technologiesSet).sort();

    return {
      props: {
        articles: newsResponse.articles,
        total: newsResponse.total,
        page: newsResponse.page,
        limit: newsResponse.limit,
        totalPages: newsResponse.total_pages,
        hasNext: newsResponse.has_next,
        hasPrev: newsResponse.has_prev,
        companies,
        newsTypes,
        technologies,
        sources,
        selectedCompany: company as string || null,
        selectedNewsType: news as string || null,
        selectedTechnology: tech as string || null,
        selectedSource: source as string || null,
        searchQuery: search as string || null,
      },
    };
  } catch (error) {
    console.error('Error fetching news:', error);

    return {
      props: {
        articles: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
        companies: [],
        newsTypes: [],
        technologies: [],
        sources: [],
        selectedCompany: null,
        selectedNewsType: null,
        selectedTechnology: null,
        selectedSource: null,
        searchQuery: null,
      },
    };
  }
};

