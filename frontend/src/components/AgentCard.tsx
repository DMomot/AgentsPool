'use client';

import Link from 'next/link';
import { AgentList } from '../types';

interface AgentCardProps {
  agent: AgentList;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'Бесплатно';
    return `$${price.toFixed(2)}`;
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}k`;
    }
    return downloads.toString();
  };

  return (
    <div className="card group cursor-pointer">
      <Link href={`/agents/${agent.slug}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {agent.name}
              </h3>
              {agent.author && (
                <p className="text-sm text-gray-500 mt-1">by {agent.author}</p>
              )}
            </div>
            {agent.featured && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⭐ Рекомендуем
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-3">
            {agent.short_description || 'Описание не указано'}
          </p>

          {/* Tags */}
          {agent.tags && agent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
              {agent.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                  +{agent.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Category */}
          {agent.category && (
            <div className="flex items-center space-x-2">
              <span className="text-lg">{agent.category.icon}</span>
              <span className="text-sm text-gray-600">{agent.category.name}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              {/* Rating */}
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {formatRating(agent.rating)}
                </span>
              </div>

              {/* Downloads */}
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-600">
                  {formatDownloads(agent.downloads_count)}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <span className={`text-sm font-semibold ${
                agent.is_free ? 'text-green-600' : 'text-gray-900'
              }`}>
                {formatPrice(agent.price, agent.is_free)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
