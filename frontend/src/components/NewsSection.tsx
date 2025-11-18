import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/api';
import { NewsArticle } from '../types';

export default function NewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await apiClient.getNews({ limit: 6 });
        setNews(response.articles);
      } catch (err) {
        console.error('Error fetching news:', err);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

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

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Latest News
          </h2>
          <p className="text-lg text-gray-600">
            Stay updated with AI and agent developments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : (
            news.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.id}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow group block no-underline"
              >
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={article.img_url || '/agents_pool.webp'}
                    alt={decodeHtmlEntities(article.title)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/agents_pool.webp';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {decodeHtmlEntities(article.title)}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{article.source_name}</span>
                    <span>•</span>
                    <time>{formatDate(article.published_at)}</time>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="text-center">
          <Link
            href="/news"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            More News
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

