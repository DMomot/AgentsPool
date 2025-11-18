import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/api';
import { NewsArticle } from '../types';

interface RelatedNewsProps {
  agentUrl?: string;
}

export default function RelatedNews({ agentUrl }: RelatedNewsProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      if (!agentUrl) {
        setNews([]);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.getNewsByAgentUrl(agentUrl, 5);
        setNews(response.articles);
      } catch (err) {
        console.error('Error fetching related news:', err);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [agentUrl]);

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
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Related News</h2>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-gray-50 rounded-lg overflow-hidden animate-pulse">
              <div className="w-full h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : !news || news.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">No related news found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.slice(0, 5).map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.id}`}
              className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-sm transition-shadow group block no-underline border border-gray-200"
            >
              <div className="w-full h-40 overflow-hidden">
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
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-primary-600 transition-colors">
                  {decodeHtmlEntities(article.title)}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{article.source_name}</span>
                  <span>•</span>
                  <time>{formatDate(article.published_at)}</time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

