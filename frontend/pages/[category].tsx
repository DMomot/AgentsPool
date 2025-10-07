import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import AgentCard from '../src/components/AgentCard';
import Pagination from '../src/components/Pagination';
import { AgentList } from '../src/types';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

interface CategoryPageData {
  agents: AgentList[];
  category: Category;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function CategoryPage() {
  const router = useRouter();
  const { category: categorySlug, page = '1' } = router.query;
  
  const [data, setData] = useState<CategoryPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Skip static files like sitemap.xml, robots.txt, etc
  if (categorySlug && typeof categorySlug === 'string' && categorySlug.includes('.')) {
    return null;
  }

  useEffect(() => {
    if (!categorySlug || typeof categorySlug !== 'string') return;

    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentPage = parseInt(page as string) || 1;
        
        // Use Next.js API routes (proxy to backend)
        const response = await fetch(
          `/api/v1/categories/${categorySlug}/agents?page=${currentPage}&limit=12`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError('Category not found');
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug, page]);

  const handlePageChange = (newPage: number) => {
    router.push(`/${categorySlug}?page=${newPage}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error === 'Category not found' ? 'Category Not Found' : 'Error'}
            </h1>
            <p className="text-gray-600 mb-8">
              {error || 'Something went wrong while loading the category.'}
            </p>
            <button
              onClick={() => router.push('/catalog')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Catalog
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { category, agents, total, page: currentPage, total_pages, has_next, has_prev } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{category.name} - AI Agents | AgentsPool</title>
        <meta 
          name="description" 
          content={`Discover ${total} AI agents in ${category.name}. ${category.description}`} 
        />
        <meta name="keywords" content={`AI agents, ${category.name}, artificial intelligence, automation`} />
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600 mt-2">{category.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Found {total} agent{total !== 1 ? 's' : ''} in this category
            </p>
            <button
              onClick={() => router.push('/catalog')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              ← Back to All Categories
            </button>
          </div>
        </div>

        {/* Agents Grid */}
        {agents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>

            {/* Pagination */}
            {total_pages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={total_pages}
                totalItems={total}
                itemsPerPage={12}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No agents found in this category
            </h2>
            <p className="text-gray-600 mb-6">
              This category doesn't have any agents yet. Check back later!
            </p>
            <button
              onClick={() => router.push('/catalog')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Explore Other Categories
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
