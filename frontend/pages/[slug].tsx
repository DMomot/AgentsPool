import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import AgentCard from '../src/components/AgentCard';
import Pagination from '../src/components/Pagination';
import MetaTags from '../src/components/MetaTags';
import RelatedNews from '../src/components/RelatedNews';
import { AgentList } from '../src/types';

// Category interfaces
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

// Agent interfaces
interface PricingPlan {
  name: string;
  price: string | null;
  description: string | null;
  features: string[];
}

interface PricingData {
  pricing_url: string | null;
  extracted_at: string;
  plans_count: number;
  has_free_plan: boolean;
  plans: PricingPlan[];
}

interface Agent {
  id: number;
  name: string;
  description: string;
  short_description: string;
  author: string;
  featured: boolean;
  slug: string;
  tags: string[];
  capabilities: string[];
  use_cases: string[];
  url: string;
  documentation_url: string;
  github_url: string;
  api_endpoint: string;
  a2a?: string;
  img_url?: string;
  pricing?: PricingData | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  model_info?: {
    logo_url?: string;
    screenshots?: string[];
    website_url?: string;
    contact_email?: string;
    pricing_model?: string;
  };
  created_at: string;
  updated_at: string;
}

interface SlugPageProps {
  type: 'category' | 'agent';
  categoryData?: CategoryPageData | null;
  agent?: Agent | null;
  error?: string;
  slug: string;
}

export const getServerSideProps: GetServerSideProps<SlugPageProps> = async (context) => {
  const { slug, page = '1' } = context.query;

  // Skip static files
  if (typeof slug === 'string' && slug.includes('.')) {
    return { notFound: true };
  }

  if (!slug || typeof slug !== 'string') {
    return { notFound: true };
  }

  // Skip special pages
  if (['catalog', 'categories', 'agents', 'news', 'about', 'contact'].includes(slug)) {
    return { notFound: true };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';

  // Try to load as category first
  try {
    const currentPage = parseInt(page as string) || 1;
    const categoryResponse = await fetch(
      `${apiUrl}/api/v1/categories/${slug}/agents?page=${currentPage}&limit=12`
    );

    if (categoryResponse.ok) {
      const categoryData = await categoryResponse.json();
      return {
        props: {
          type: 'category',
          categoryData,
          slug,
        },
      };
    }
  } catch (err) {
    console.error('Error fetching category:', err);
  }

  // If not a category, try to load as agent
  try {
    const agentResponse = await fetch(`${apiUrl}/api/v1/agents/slug/${slug}`);

    if (agentResponse.ok) {
      const agent = await agentResponse.json();
      return {
        props: {
          type: 'agent',
          agent,
          slug,
        },
      };
    }
  } catch (err) {
    console.error('Error fetching agent:', err);
  }

  // If neither category nor agent found, return 404
  return { notFound: true };
};

const PricingCard = ({ plan }: { plan: PricingPlan }) => {
  const isFree = plan.price && (
    plan.price.toLowerCase().includes('free') ||
    plan.price.toLowerCase().includes('$0') ||
    plan.price.startsWith('0 ')
  );
  
  const isContact = plan.price && (
    plan.price.toLowerCase().includes('contact') ||
    plan.price.toLowerCase().includes('sales') ||
    plan.price.toLowerCase().includes('talk') ||
    plan.price.toLowerCase().includes('custom')
  );

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
        {plan.price ? (
          <div className="text-2xl font-bold text-blue-600">
            {plan.price}
            {isFree && <span className="ml-2 text-sm font-normal text-green-600">Free</span>}
            {isContact && <span className="ml-2 text-sm font-normal text-gray-600">Custom</span>}
          </div>
        ) : (
          <div className="text-2xl font-bold text-gray-500">N/A</div>
        )}
      </div>
      
      {plan.description && (
        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
      )}
      
      {plan.features.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Features:</h4>
          <ul className="space-y-2">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start text-sm">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ImageModal = ({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-10"
        aria-label="Close"
      >
        ×
      </button>
      <img
        src={imageUrl}
        alt="Full size"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// Category Page Component
function CategoryPage({ data, slug }: { data: CategoryPageData; slug: string }) {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    router.push(`/${slug}?page=${newPage}`);
  };

  const { category, agents, total, page: currentPage, total_pages } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags
        title={`${category.name} - AI Agents`}
        description={`Discover ${total} AI agents in ${category.name}. ${category.description}`}
        keywords={`AI agents, ${category.name}, artificial intelligence, automation`}
        url={`https://agentspool.ai/${slug}`}
        canonicalUrl={`https://agentspool.ai/${slug}`}
      />

      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <a href="/" className="hover:text-primary-600 transition-colors">Home</a>
            </li>
            <li>
              <span className="mx-2">›</span>
            </li>
            <li>
              <a href="/categories" className="hover:text-primary-600 transition-colors">Categories</a>
            </li>
            <li>
              <span className="mx-2">›</span>
            </li>
            <li className="text-gray-900 font-medium">
              {category.name}
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Description */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3">{category.icon}</span>
                <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed">{category.description}</p>
            </div>

            {/* Right: Image */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <img
                  src={`/Categories_img/${category.slug}.png`}
                  alt={category.name}
                  className="w-full h-auto rounded-xl shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
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

// Agent Page Component
function AgentPage({ agent }: { agent: Agent }) {
  const router = useRouter();
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags
        title={`${agent.name} - AI Agent`}
        description={agent.description || agent.short_description}
        keywords={`${agent.name}, AI agent, ${agent.tags?.join(', ') || ''}, artificial intelligence, automation`}
        url={`https://agentspool.ai/${agent.slug}`}
        canonicalUrl={`https://agentspool.ai/${agent.slug}`}
        type="article"
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <a href="/" className="hover:text-primary-600 transition-colors">Home</a>
            </li>
            <li>
              <span className="mx-2">›</span>
            </li>
            <li>
              <a href="/catalog" className="hover:text-primary-600 transition-colors">Catalog</a>
            </li>
            {agent.category && (
              <>
                <li>
                  <span className="mx-2">›</span>
                </li>
                <li>
                  <a href={`/${agent.category.slug}`} className="hover:text-primary-600 transition-colors">
                    {agent.category.name}
                  </a>
                </li>
              </>
            )}
            <li>
              <span className="mx-2">›</span>
            </li>
            <li className="text-gray-900 font-medium">
              {agent.name}
            </li>
          </ol>
        </nav>

        {/* Agent Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Content */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{agent.name}</h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">{agent.short_description}</p>

              {/* Links */}
              <div className="space-y-3 mb-6">
                {agent.url && (
                  <div>
                    <a
                      href={agent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {agent.url}
                    </a>
                  </div>
                )}
                {agent.github_url && (
                  <div>
                    <a
                      href={agent.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub
                    </a>
                  </div>
                )}
              </div>

              {/* Tags */}
              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Image */}
            <div className="flex items-center justify-center">
              <div 
                className="relative w-full rounded-xl overflow-hidden shadow-lg bg-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => setModalImage(`https://pub-cd507b944a95482a8deaa9b622cb1a6d.r2.dev/screenshots/${agent.slug}.png`)}
              >
                <img
                  src={agent.img_url || `https://pub-cd507b944a95482a8deaa9b622cb1a6d.r2.dev/thumbnails/${agent.slug}_thumbnail.webp`}
                  alt={agent.name}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                  <span className="text-white text-lg font-medium bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    Click to enlarge
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{agent.description}</p>
          </div>
        </div>

        {/* Screenshots */}
        {agent.model_info?.screenshots && agent.model_info.screenshots.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Screenshots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agent.model_info.screenshots.map((screenshot, index) => (
                <div 
                  key={index} 
                  className="relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setModalImage(screenshot)}
                >
                  <img
                    src={screenshot}
                    alt={`${agent.name} screenshot ${index + 1}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pricing Plans</h2>
            {agent.pricing?.has_free_plan && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Free Plan Available
              </span>
            )}
          </div>
          
          {!agent.pricing || agent.pricing.plans_count === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">No pricing information found</p>
              {agent.pricing?.pricing_url && (
                <a
                  href={agent.pricing.pricing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Visit pricing page
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {agent.pricing.plans.map((plan, index) => (
                  <PricingCard key={index} plan={plan} />
                ))}
              </div>
              {agent.pricing.pricing_url && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <a
                    href={agent.pricing.pricing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    View full pricing details →
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Capabilities */}
        {agent.capabilities && agent.capabilities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Capabilities</h2>
            <ul className="space-y-2">
              {agent.capabilities.map((capability, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{capability}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Use Cases */}
        {agent.use_cases && agent.use_cases.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Use Cases</h2>
            <ul className="space-y-2">
              {agent.use_cases.map((useCase, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <RelatedNews agentUrl={agent.url} />
      </main>

      <Footer />
      
      {/* Image Modal */}
      {modalImage && (
        <ImageModal 
          imageUrl={modalImage} 
          onClose={() => setModalImage(null)} 
        />
      )}
    </div>
  );
}

// Main component that routes to the right page
export default function SlugPage({ type, categoryData, agent, error, slug }: SlugPageProps) {
  const router = useRouter();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
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

  if (type === 'category' && categoryData) {
    return <CategoryPage data={categoryData} slug={slug} />;
  }

  if (type === 'agent' && agent) {
    return <AgentPage agent={agent} />;
  }

  return null;
}

