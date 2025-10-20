import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Header from '../../src/components/Header';
import Footer from '../../src/components/Footer';
import MetaTags from '../../src/components/MetaTags';

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
        description={agent.short_description || agent.description}
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
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-sm text-gray-600">
                  by {agent.author}
                </div>
              </div>

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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {agent.url && (
                  <a
                    href={agent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white text-center px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    🌐 Visit Website
                  </a>
                )}
                {agent.github_url && (
                  <a
                    href={agent.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 text-white text-center px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                  >
                    ⭐ GitHub
                  </a>
                )}
              </div>
            </div>

            {/* Right: Image */}
            <div className="w-full md:w-96 flex-shrink-0">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={agent.img_url || agent.model_info?.logo_url || '/16x9-placeholder.jpg'}
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
