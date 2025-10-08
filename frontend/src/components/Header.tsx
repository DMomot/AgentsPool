'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">AgentsPool</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search AI agents..."
                className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/catalog" className="text-gray-700 hover:text-primary-600 font-medium">
              Catalog
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-primary-600 font-medium">
              Categories
            </Link>
            <Link href="/agents" className="text-gray-700 hover:text-primary-600 font-medium">
              All Agents
            </Link>
            <Link href="/fundraising" className="text-gray-700 hover:text-primary-600 font-medium">
              Fundraising
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium">
              About
            </Link>
            <Link href="/add-agent" className="text-gray-700 hover:text-primary-600 font-medium">
              Add Agent
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link href="/catalog" className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium">
                Catalog
              </Link>
              <Link href="/categories" className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium">
                Categories
              </Link>
              <Link href="/fundraising" className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium">
                Fundraising
              </Link>
              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium">
                About
              </Link>
              <Link href="/add-agent" className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium">
                Add Agent
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
