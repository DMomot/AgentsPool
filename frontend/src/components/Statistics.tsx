'use client';

import Link from 'next/link';

export default function Statistics() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/catalog" className="btn-primary text-lg px-8 py-3">
            Browse Catalog
          </Link>
          <Link href="/categories" className="btn-secondary text-lg px-8 py-3">
            Agent Categories
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">1,400+</div>
            <div className="text-gray-600">AI agents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">22</div>
            <div className="text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">A2A Ready</div>
            <div className="text-gray-600">Agent-to-agent discovery</div>
          </div>
        </div>
      </div>
    </section>
  );
}

