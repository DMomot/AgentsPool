import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Header from '../../src/components/Header';
import Footer from '../../src/components/Footer';
import MetaTags from '../../src/components/MetaTags';

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

interface AgentPageProps {
  agent: Agent | null;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<AgentPageProps> = async (context) => {
  const { slug } = context.params as { slug: string };

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';
    const response = await fetch(`${apiUrl}/api/v1/agents/slug/${slug}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          notFound: true,
        };
      }
      throw new Error('Failed to fetch agent');
    }

    const agent = await response.json();

    return {
      props: {
        agent,
      },
    };
  } catch (error) {
    console.error('Error fetching agent:', error);
    return {
      props: {
        agent: null,
        error: 'Failed to load agent',
      },
    };
  }
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

export default function AgentPage({ agent, error }: AgentPageProps) {
  const router = useRouter();

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error || 'Agent not found'}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags
        title={`${agent.name} - AI Agent`}
        description={agent.description || agent.short_description}
        keywords={`${agent.name}, AI agent, ${agent.tags?.join(', ') || ''}, artificial intelligence, automation`}
        url={`https://agentspool.ai/agents/${agent.slug}`}
        canonicalUrl={`https://agentspool.ai/agents/${agent.slug}`}
        type="article"
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Content */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{agent.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{agent.short_description}</p>

              {/* Tags */}
              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {agent.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="space-y-2">
                {agent.url && (
                  <div>
                    <a
                      href={agent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
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
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {agent.github_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Image */}
            <div className="w-full md:w-96 flex-shrink-0">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={agent.img_url || `https://pub-cd507b944a95482a8deaa9b622cb1a6d.r2.dev/thumbnails/${agent.slug}_thumbnail.webp`}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
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
                <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
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
        {agent.pricing && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Pricing Plans</h2>
              {agent.pricing.has_free_plan && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Free Plan Available
                </span>
              )}
            </div>
            
            {agent.pricing.plans_count === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">No pricing information available</p>
                {agent.pricing.pricing_url && (
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
        )}

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
      </main>

      <Footer />
    </div>
  );
}
