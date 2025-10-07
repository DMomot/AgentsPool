'use client';

import Link from 'next/link';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  agentCount?: number;
  featured?: boolean;
}

export default function CategoryCard({ category, agentCount = 0, featured = false }: CategoryCardProps) {
  return (
    <Link href={`/catalog?category_id=${category.id}`}>
      <div className={`card group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
        featured ? 'ring-2 ring-primary-200 bg-gradient-to-br from-primary-50 to-white' : ''
      }`}>
        <div className="text-center">
          {/* Icon */}
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
            {category.icon}
          </div>

          {/* Category Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
            {category.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {category.description}
          </p>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>{agentCount} agents</span>
            </div>
          </div>

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⭐ Popular
              </span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 border-t border-gray-100">
            <div className="inline-flex items-center text-primary-600 font-medium text-sm group-hover:text-primary-700 transition-colors">
              View Agents
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
