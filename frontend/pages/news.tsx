import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
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
  sources: Array<{ name: string; domain: string }>;
  tags: string[];
  selectedTag?: string;
  selectedSource?: string;
}

export default function NewsPage({
  articles,
  total,
  page,
  limit,
  totalPages,
  hasNext,
  hasPrev,
  sources,
  tags,
  selectedTag,
  selectedSource,
}: NewsPageProps) {
  const router = useRouter();

  const handleFilterChange = (filterType: 'tag' | 'source', value: string) => {
    const query: any = { page: '1' };
    
    if (filterType === 'tag') {
      if (value) query.tag = value;
      if (selectedSource) query.source = selectedSource;
    } else {
      if (value) query.source = value;
      if (selectedTag) query.tag = selectedTag;
    }
    
    router.push({
      pathname: '/news',
      query,
    });
  };

  const clearFilters = () => {
    router.push('/news');
  };

  const handlePageChange = (newPage: number) => {
    const query: any = { page: newPage.toString() };
    if (selectedTag) query.tag = selectedTag;
    if (selectedSource) query.source = selectedSource;
    
    router.push({
      pathname: '/news',
      query,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Tag
                </label>
                <select
                  value={selectedTag || ''}
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Source
                </label>
                <select
                  value={selectedSource || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {(selectedTag || selectedSource) && (
              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* News Articles */}
          <div className="space-y-6 mb-8">
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
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {article.title}
                      </a>
                    </div>
                  </div>

                  {article.description && (
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {article.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="font-medium text-blue-600">
                      {article.source_name}
                    </span>
                    <span>•</span>
                    <time>{formatDate(article.published_at)}</time>
                    {article.companies && article.companies.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex flex-wrap gap-2">
                          {article.companies.map((company, idx) => (
                            <span key={idx} className="text-gray-700 font-medium">
                              {company}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center"
                    >
                      Read More
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
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
    const { page = '1', tag, source } = context.query;
    const pageNum = parseInt(page as string, 10);

    // Fetch news articles
    const newsResponse = await apiClient.getNews({
      page: pageNum,
      limit: 20,
      tag: tag as string,
      source: source as string,
    });

    // Fetch sources and tags for filters
    const [sources, tags] = await Promise.all([
      apiClient.getNewsSources(),
      apiClient.getNewsTags(),
    ]);

    return {
      props: {
        articles: newsResponse.articles,
        total: newsResponse.total,
        page: newsResponse.page,
        limit: newsResponse.limit,
        totalPages: newsResponse.total_pages,
        hasNext: newsResponse.has_next,
        hasPrev: newsResponse.has_prev,
        sources,
        tags,
        selectedTag: tag || null,
        selectedSource: source || null,
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
        sources: [],
        tags: [],
        selectedTag: null,
        selectedSource: null,
      },
    };
  }
};

