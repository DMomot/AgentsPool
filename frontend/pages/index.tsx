import { useState, useEffect } from 'react';
import Header from '../src/components/Header';
import Hero from '../src/components/Hero';
import FeaturedAgents from '../src/components/FeaturedAgents';
import Footer from '../src/components/Footer';
import MetaTags from '../src/components/MetaTags';
import { apiClient } from '../src/lib/api';

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, statsData] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getCategoryStats()
        ]);
        setCategories(categoriesData);
        setCategoryStats(statsData.category_stats);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to empty if API fails
        setCategories([]);
        setCategoryStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get top 8 categories by agent count
  const getTopCategories = () => {
    return categories
      .map(cat => ({ 
        ...cat, 
        count: categoryStats[cat.id] || 0 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const topCategories = getTopCategories();

  return (
    <>
      <MetaTags
        title="PrimeAgents - Best AI Agents Catalog"
        description="Find the perfect AI agent for your business. 500+ verified artificial intelligence solutions with reviews, ratings, and demos."
        keywords="AI agents, artificial intelligence, business automation, chatbots, machine learning, neural networks, AI catalog"
        url="https://primeagents.info"
        type="website"
      />
      <main className="min-h-screen bg-white">
        <Header />
        <Hero />
        <FeaturedAgents />
      
      {/* Categories Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-gray-600">
              Find agents for any task
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="card text-center animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              ))
            ) : (
              topCategories.map((category) => (
                <div
                  key={category.id}
                  className="card text-center group cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => window.location.href = `/categories#category-${category.id}`}
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.count} agents</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose PrimeAgents?
            </h2>
            <p className="text-lg text-gray-600">
              We make AI accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Deployment
              </h3>
              <p className="text-gray-600">
                Launch an AI agent in minutes with a simple API
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Verified Quality
              </h3>
              <p className="text-gray-600">
                All agents undergo thorough review by our experts
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Our team is always ready to help with integration and setup
              </p>
            </div>
          </div>
        </div>
      </section>

        <Footer />
      </main>
    </>
  );
}
