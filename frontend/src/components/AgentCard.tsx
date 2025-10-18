'use client';

import Link from 'next/link';
import { AgentList } from '../types';

interface AgentCardProps {
  agent: AgentList;
}

export default function AgentCard({ agent }: AgentCardProps) {
  // Don't render if no slug (prevents /agents/null)
  if (!agent.slug) {
    return null;
  }

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
            <div className="text-sm text-gray-500">
              {agent.category?.name || 'Uncategorized'}
            </div>
            {agent.featured && (
              <span className="px-2 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded">
                Featured
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
