import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../src/components/Header';
import Hero from '../src/components/Hero';
import FeaturedAgents from '../src/components/FeaturedAgents';
import Statistics from '../src/components/Statistics';
import NewsSection from '../src/components/NewsSection';
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
        title="AgentsPool - Discover the Best AI Agents & Autonomous Solutions"
        description="Explore 500+ verified AI agents and autonomous solutions. Compare features, read reviews, and find the perfect AI agent for your business needs."
        keywords="AI agents, artificial intelligence, business automation, chatbots, machine learning, neural networks, AI catalog"
        url="https://agentspool.ai"
        canonicalUrl="https://agentspool.ai"
        type="website"
      />
      <main className="min-h-screen bg-white">
        <Header />
        <Hero />

        <FeaturedAgents />

        <Statistics />

        <NewsSection />
      
      {/* Categories Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
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
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className="card text-center group cursor-pointer hover:shadow-lg transition-all duration-200 block no-underline"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.count} agents</p>
                </Link>
              ))
            )}
          </div>

          {/* Show All Button */}
          <div className="text-center mt-12">
            <Link
              href="/categories"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Show All Categories
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

        <Footer />
      </main>
    </>
  );
}
