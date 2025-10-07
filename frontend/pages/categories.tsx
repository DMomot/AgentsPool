import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  slug: string;
  agent_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryStats, setCategoryStats] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use Next.js API routes (proxy to backend)
        const [categoriesResponse, statsResponse] = await Promise.all([
          fetch('/api/v1/categories'),
          fetch('/api/v1/categories/stats')
        ]);

        if (!categoriesResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const categoriesData = await categoriesResponse.json();
        const statsData = await statsResponse.json();

        setCategories(categoriesData);
        
        // Use stats object directly (API returns {category_stats: {id: count}, ...})
        const statsMap: {[key: number]: number} = {};
        if (statsData.category_stats) {
          Object.entries(statsData.category_stats).forEach(([categoryId, count]) => {
            statsMap[parseInt(categoryId)] = count as number;
          });
        }
        setCategoryStats(statsMap);

      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading categories...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI Agent Categories | AgentsPool</title>
        <meta 
          name="description" 
          content="Browse AI agents by category. Find the perfect AI solution for your needs across different industries and use cases." 
        />
        <meta name="keywords" content="AI agents, categories, artificial intelligence, automation, business tools" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Agent Categories</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of AI agents organized by category. 
            Find the perfect solution for your specific needs.
          </p>
          <div className="mt-6">
            <Link 
              href="/catalog" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Search All Agents →
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const agentCount = categoryStats[category.id] || 0;
            
            return (
              <Link 
                key={category.id} 
                href={`/${category.slug}`}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-200 transition-all duration-200 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{category.icon}</div>
                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {agentCount} agent{agentCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                    Explore category
                    <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-gray-600 mb-6">
              Use our advanced search to find agents by name, description, or specific features.
            </p>
            <Link 
              href="/catalog"
              className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search All Agents
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}