import { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import Header from '../../../src/components/Header';
import Footer from '../../../src/components/Footer';
import MetaTags from '../../../src/components/MetaTags';
import { apiClient } from '../../../src/lib/api';
import { AgentList } from '../../../src/types';

interface LetterPageProps {
  letter: string;
  agents: AgentList[];
  totalCount: number;
  availableLetters: string[];
}

export default function LetterPage({ letter, agents, totalCount, availableLetters }: LetterPageProps) {
  const displayLetter = letter === 'numbers' ? '#' : letter.toUpperCase();
  const letterName = letter === 'numbers' ? 'Numbers & Symbols' : `Letter ${letter.toUpperCase()}`;

  return (
    <>
      <MetaTags
        title={`AI Agents Starting with ${displayLetter} - Directory`}
        description={`Browse ${totalCount} AI agents starting with ${displayLetter}. Find the perfect artificial intelligence solution organized alphabetically.`}
        keywords={`AI agents ${displayLetter}, artificial intelligence ${displayLetter}, agents starting with ${displayLetter}, AI directory`}
        url={`https://agentspool.ai/agents/browse/${letter}`}
        canonicalUrl={`https://agentspool.ai/agents/browse/${letter}`}
      />

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/agents" className="hover:text-blue-600">
                  All Agents
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">{displayLetter}</li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {letterName}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {totalCount} AI agents starting with {displayLetter}
            </p>
          </div>

          {/* Alphabet Navigation */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse Other Letters</h2>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {/* Numbers button */}
              <Link
                href="/agents/browse/numbers"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  letter === 'numbers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                #
              </Link>

              {/* Alphabet buttons */}
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => {
                const hasAgents = availableLetters.includes(l.toLowerCase());
                const currentLetter = l.toLowerCase();
                
                return hasAgents ? (
                  <Link
                    key={l}
                    href={`/agents/browse/${currentLetter}`}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      letter === currentLetter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {l}
                  </Link>
                ) : (
                  <span
                    key={l}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-gray-50 text-gray-400 cursor-not-allowed"
                  >
                    {l}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Agents List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(agent => (
                    <Link
                      key={agent.id}
                      href={`/agents/${agent.slug}`}
                      className="block border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative w-full aspect-video bg-gray-100">
                        <img
                          src={agent.img_url || `https://pub-cd507b944a95482a8deaa9b622cb1a6d.r2.dev/thumbnails/${agent.slug}_thumbnail.webp`}
                          alt={agent.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                            {agent.name}
                          </h3>
                        </div>

                        {agent.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {agent.description}
                          </p>
                        )}

                        {agent.tags && agent.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {agent.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {agent.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{agent.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No agents found starting with {displayLetter}
                </p>
                <Link
                  href="/agents"
                  className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse All Letters
                </Link>
              </div>
            )}
          </div>

          {/* Back to directory */}
          <div className="text-center mt-8">
            <Link
              href="/agents"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Directory
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Get all agents to determine available letters
    const agentsResponse = await apiClient.searchAgents({ 
      limit: 2000,
      sort_by: 'name',
      sort_order: 'asc'
    });

    // Group agents by first letter
    const letterCounts: { [key: string]: number } = {};
    
    agentsResponse.agents.forEach(agent => {
      const firstLetter = agent.name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstLetter) ? firstLetter.toLowerCase() : 'numbers';
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });

    // Generate paths for letters that have agents
    const paths = Object.keys(letterCounts).map(letter => ({
      params: { letter }
    }));

    return {
      paths,
      fallback: false, // Return 404 for non-existent letters
    };
  } catch (error) {
    console.error('Error generating letter paths:', error);
    return {
      paths: [],
      fallback: false,
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const letter = params?.letter as string;
    
    if (!letter) {
      return { notFound: true };
    }

    // Get all agents
    const agentsResponse = await apiClient.searchAgents({ 
      limit: 2000,
      sort_by: 'name',
      sort_order: 'asc'
    });

    // Filter agents by letter
    const filteredAgents = agentsResponse.agents.filter(agent => {
      const firstLetter = agent.name.charAt(0).toUpperCase();
      if (letter === 'numbers') {
        return !/[A-Z]/.test(firstLetter);
      }
      return firstLetter === letter.toUpperCase();
    });

    // Get available letters for navigation
    const letterCounts: { [key: string]: number } = {};
    agentsResponse.agents.forEach(agent => {
      const firstLetter = agent.name.charAt(0).toUpperCase();
      const agentLetter = /[A-Z]/.test(firstLetter) ? firstLetter.toLowerCase() : 'numbers';
      letterCounts[agentLetter] = (letterCounts[agentLetter] || 0) + 1;
    });

    const availableLetters = Object.keys(letterCounts).filter(l => l !== 'numbers');

    return {
      props: {
        letter,
        agents: filteredAgents,
        totalCount: filteredAgents.length,
        availableLetters,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching agents for letter:', error);
    
    return {
      props: {
        letter: params?.letter as string || '',
        agents: [],
        totalCount: 0,
        availableLetters: [],
      },
      revalidate: 300,
    };
  }
};
