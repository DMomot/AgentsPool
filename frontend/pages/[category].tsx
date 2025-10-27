import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import AgentCard from '../src/components/AgentCard';
import Pagination from '../src/components/Pagination';
import MetaTags from '../src/components/MetaTags';
import { AgentList } from '../src/types';

interface Category {
  id: number;
  name: string;
  description: string;
  title?: string;
  text?: string;
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

interface CategoryPageProps {
  data: CategoryPageData | null;
  error?: string;
  categorySlug: string;
}

export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async (context) => {
  const { category: categorySlug, page = '1' } = context.query;

  // Skip static files
  if (typeof categorySlug === 'string' && categorySlug.includes('.')) {
    return { notFound: true };
  }

  if (!categorySlug || typeof categorySlug !== 'string') {
    return { notFound: true };
  }

  try {
    const currentPage = parseInt(page as string) || 1;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';
    
    const response = await fetch(
      `${apiUrl}/api/v1/categories/${categorySlug}/agents?page=${currentPage}&limit=12`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      props: {
        data,
        categorySlug,
      },
    };
  } catch (err) {
    console.error('Error fetching category data:', err);
    return {
      props: {
        data: null,
        error: 'Failed to load category data',
        categorySlug: categorySlug as string,
      },
    };
  }
};

export default function CategoryPage({ data, error, categorySlug }: CategoryPageProps) {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    router.push(`/${categorySlug}?page=${newPage}`);
  };

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
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

  const { category, agents, total, page: currentPage, total_pages } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags
        title={`${category.name} - AI Agents`}
        description={`Discover ${total} AI agents in ${category.name}. ${category.description}`}
        keywords={`AI agents, ${category.name}, artificial intelligence, automation`}
        url={`https://agentspool.ai/${categorySlug}`}
        canonicalUrl={`https://agentspool.ai/${categorySlug}`}
      />

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

        {/* Category Text */}
        {category.text && (
          <div className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div 
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ 
                __html: category.text.replace(/\|\|/g, '<br/><br/>') 
              }}
            />
          </div>
        )}

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
