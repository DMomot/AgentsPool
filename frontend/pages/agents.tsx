import { GetStaticProps } from 'next';
import Link from 'next/link';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import MetaTags from '../src/components/MetaTags';
import { apiClient } from '../src/lib/api';

interface AgentsPageProps {
  totalCount: number;
  letterStats: { [key: string]: number };
  availableLetters: string[];
}

export default function AgentsPage({ totalCount, letterStats, availableLetters }: AgentsPageProps) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const hasNumbers = letterStats['numbers'] && letterStats['numbers'] > 0;

  return (
    <>
      <MetaTags
        title="Complete AI Agents Directory A-Z - Full Alphabetical List"
        description={`Browse all ${totalCount} AI agents alphabetically from A to Z. Complete directory with easy navigation to find any agent by name quickly.`}
        keywords="AI agents directory, all agents, alphabetical list, artificial intelligence catalog, agent index"
        url="https://agentspool.ai/agents"
        canonicalUrl="https://agentspool.ai/agents"
      />

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              All AI Agents Directory
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Complete alphabetical directory of {totalCount} AI agents
            </p>
          </div>

          {/* Alphabet Navigation */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Letter</h2>
            
            <div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-13 gap-3">
              {/* Numbers button */}
              {hasNumbers && (
                <Link
                  href="/agents/browse/numbers"
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-all"
                >
                  <span className="text-2xl font-bold text-blue-600 mb-2">#</span>
                  <span className="text-xs text-gray-600 text-center">
                    {letterStats['numbers']} agents
                  </span>
                </Link>
              )}

              {/* Alphabet buttons */}
              {alphabet.map(letter => {
                const letterKey = letter.toLowerCase();
                const hasAgents = availableLetters.includes(letterKey);
                const count = letterStats[letterKey] || 0;
                
                return hasAgents ? (
                  <Link
                    key={letter}
                    href={`/agents/browse/${letterKey}`}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-all"
                  >
                    <span className="text-2xl font-bold text-blue-600 mb-2">{letter}</span>
                    <span className="text-xs text-gray-600 text-center">
                      {count} agents
                    </span>
                  </Link>
                ) : (
                  <div
                    key={letter}
                    className="flex flex-col items-center p-4 bg-gray-100 rounded-lg border border-gray-200 opacity-50"
                  >
                    <span className="text-2xl font-bold text-gray-400 mb-2">{letter}</span>
                    <span className="text-xs text-gray-400 text-center">
                      0 agents
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick stats */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Total: <span className="font-semibold">{totalCount} agents</span> across{' '}
                <span className="font-semibold">{availableLetters.length + (hasNumbers ? 1 : 0)} categories</span>
              </p>
            </div>
          </div>

        </main>

        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Get all agents for statistics
    const agentsResponse = await apiClient.searchAgents({ 
      limit: 2000,
      sort_by: 'name',
      sort_order: 'asc'
    });

    // Calculate letter statistics
    const letterStats: { [key: string]: number } = {};
    const availableLetters: string[] = [];

    agentsResponse.agents.forEach(agent => {
      const firstLetter = agent.name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstLetter) ? firstLetter.toLowerCase() : 'numbers';
      
      letterStats[letter] = (letterStats[letter] || 0) + 1;
      
      if (letter !== 'numbers' && !availableLetters.includes(letter)) {
        availableLetters.push(letter);
      }
    });

    // Sort available letters
    availableLetters.sort();

    return {
      props: {
        totalCount: agentsResponse.total,
        letterStats,
        availableLetters,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching agents for directory:', error);
    
    return {
      props: {
        totalCount: 0,
        letterStats: {},
        availableLetters: [],
      },
      revalidate: 300, // Retry more frequently on error
    };
  }
};
