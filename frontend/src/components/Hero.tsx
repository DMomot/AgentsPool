'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find the perfect{' '}
            <span className="text-primary-600">AI agent</span>
            <br />
            for your tasks
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive catalog of AI agents for business automation, 
            content creation, data analysis and much more. 
            A universal directory where both humans and AI agents can discover 
            and connect with specialized autonomous solutions.
          </p>

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
      </div>
    </div>
  );
}
