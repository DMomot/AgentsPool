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

  const thumbnailUrl = `https://pub-cd507b944a95482a8deaa9b622cb1a6d.r2.dev/thumbnails/${agent.slug}_thumbnail.webp`;
  
  return (
    <div className="card group cursor-pointer">
      <Link href={`/${agent.slug}`}>
        <div className="space-y-4">
          {/* Image */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={agent.img_url || thumbnailUrl}
              alt={agent.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {agent.name}
              </h3>
            </div>
            {agent.featured && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⭐ Рекомендуем
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-3">
            {agent.description || 'Описание не указано'}
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
        </div>
      </Link>
    </div>
  );
}
