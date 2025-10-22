'use client';

import { useState, useEffect } from 'react';
import { Category } from '../types';
import { apiClient } from '../lib/api';

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    q?: string;
    category_id?: number;
    is_free?: boolean;
    min_rating?: number;
    sort_by?: string;
    sort_order?: string;
  }) => void;
}

export default function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    q: '',
    category_id: undefined as number | undefined,
    is_free: undefined as boolean | undefined,
    min_rating: undefined as number | undefined,
    sort_by: 'rating',
    sort_order: 'desc',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, q: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      category_id: value ? parseInt(value) : undefined 
    }));
  };

  const handlePriceFilterChange = (value: string) => {
    let is_free: boolean | undefined = undefined;
    if (value === 'free') is_free = true;
    if (value === 'paid') is_free = false;
    setFilters(prev => ({ ...prev, is_free }));
  };

  const handleRatingChange = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      min_rating: value ? parseFloat(value) : undefined 
    }));
  };

  const handleSortChange = (sort_by: string, sort_order: string) => {
    setFilters(prev => ({ ...prev, sort_by, sort_order }));
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category_id: undefined,
      is_free: undefined,
      min_rating: undefined,
      sort_by: 'rating',
      sort_order: 'desc',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Agents
        </label>
        <div className="relative">
          <input
            id="search"
            type="text"
            placeholder="Enter name, description or author..."
            value={filters.q}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={filters.category_id || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Filter */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price
          </label>
          <select
            id="price"
            value={filters.is_free === true ? 'free' : filters.is_free === false ? 'paid' : ''}
            onChange={(e) => handlePriceFilterChange(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Any Price</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Rating
          </label>
          <select
            id="rating"
            value={filters.min_rating || ''}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ stars</option>
            <option value="4.0">4.0+ stars</option>
            <option value="3.5">3.5+ stars</option>
            <option value="3.0">3.0+ stars</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sort"
            value={`${filters.sort_by}-${filters.sort_order}`}
            onChange={(e) => {
              const [sort_by, sort_order] = e.target.value.split('-');
              handleSortChange(sort_by, sort_order);
            }}
            className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="rating-desc">By Rating ↓</option>
            <option value="rating-asc">By Rating ↑</option>
            <option value="downloads-desc">By Popularity ↓</option>
            <option value="downloads-asc">By Popularity ↑</option>
            <option value="name-asc">By Name A-Z</option>
            <option value="name-desc">By Name Z-A</option>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex justify-between items-center">
        <button
          onClick={clearFilters}
          className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
        >
          Clear Filters
        </button>
        
        <div className="text-sm text-gray-500">
          Active Filters: {Object.values(filters).filter(v => v !== '' && v !== undefined).length}
        </div>
      </div>
    </div>
  );
}
