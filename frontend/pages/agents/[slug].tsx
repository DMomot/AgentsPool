import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../src/components/Header';
import Footer from '../../src/components/Footer';
import MetaTags from '../../src/components/MetaTags';

interface Agent {
  id: number;
  name: string;
  description: string;
  short_description: string;
  author: string;
  version: string;
  price: number;
  is_free: boolean;
  rating: number;
  downloads_count: number;
  featured: boolean;
  slug: string;
  tags: string[];
  capabilities: string[];
  use_cases: string[];
  demo_url: string;
  documentation_url: string;
  github_url: string;
  api_endpoint: string;
  created_at: string;
  updated_at: string;
}

export default function AgentPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;

    const fetchAgent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/agents/slug/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Agent not found');
            return;
          }
          throw new Error('Failed to fetch agent');
        }

        const agentData = await response.json();
        setAgent(agentData);
      } catch (err) {
        console.error('Error fetching agent:', err);
        setError('Failed to load agent');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
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

  if (!agent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags
        title={`${agent.name} - AI Agent`}
        description={agent.short_description || agent.description}
        keywords={`${agent.name}, AI agent, ${agent.tags?.join(', ') || ''}, artificial intelligence, automation`}
        url={`https://primeagents.info/agents/${agent.slug}`}
        canonicalUrl={`https://primeagents.info/agents/${agent.slug}`}
        type="article"
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{agent.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{agent.short_description}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-sm text-gray-600">{agent.rating.toFixed(1)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {agent.downloads_count.toLocaleString()} downloads
                </div>
                <div className="text-sm text-gray-600">
                  by {agent.author}
                </div>
                <div className="text-sm text-gray-600">
                  v{agent.version}
                </div>
              </div>

              {/* Tags */}
              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
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
            </div>

            <div className="ml-6">
              <div className="text-right mb-4">
                {agent.is_free ? (
                  <span className="text-2xl font-bold text-green-600">Free</span>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">${agent.price}</span>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                {agent.demo_url && (
                  <a
                    href={agent.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Demo
                  </a>
                )}
                {agent.documentation_url && (
                  <a
                    href={agent.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-600 text-white text-center px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Documentation
                  </a>
                )}
                {agent.github_url && (
                  <a
                    href={agent.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-800 text-white text-center px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    GitHub
                  </a>
                )}
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
