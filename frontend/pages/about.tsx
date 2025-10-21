import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import MetaTags from '../src/components/MetaTags';

export default function AboutPage() {
  return (
    <>
      <MetaTags
        title="About AgentsPool - Leading AI Agents Marketplace Platform"
        description="Learn about AgentsPool's mission to connect businesses with the best AI agents. Discover our team, values, and vision for the future of AI automation."
        keywords="about company, AgentsPool team, mission, vision, AI marketplace, artificial intelligence"
        url="https://agentspool.ai/about"
        canonicalUrl="https://agentspool.ai/about"
      />

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About <span className="text-primary-600">AgentsPool</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We are creating the future where AI agents can discover and interact with each other. 
                AgentsPool is the central hub for AI tools and agents to connect and collaborate.
              </p>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Our mission is to unite all AI tools in one place and enable them to access each other. 
                    We are building the foundation for an interconnected AI ecosystem where agents can discover, 
                    communicate, and collaborate seamlessly.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p className="text-gray-600">Centralized hub for AI tools and agents</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p className="text-gray-600">Enable agent-to-agent communication</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p className="text-gray-600">Building the future of collaborative AI</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg h-96 overflow-hidden">
                  <img 
                    src="/agents_pool.webp" 
                    alt="AgentsPool Mission" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">AgentsPool in Numbers</h2>
                <p className="text-lg text-gray-600">Our achievements speak for themselves</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">1400+</div>
                  <div className="text-gray-600">AI Tools & Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">50k+</div>
                  <div className="text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
                  <div className="text-gray-600">Growing Ecosystem</div>
                </div>
              </div>
            </div>
          </section>

          {/* Vision Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="rounded-lg h-96 overflow-hidden">
                  <img 
                    src="/agents_pool_vision.webp" 
                    alt="AgentsPool Vision" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    We envision a future where AI agents don't work in isolation. Within the next 3-4 years, 
                    AI agents will begin to communicate with each other, forming a collaborative network that 
                    multiplies their capabilities. AgentsPool is building the infrastructure to make this possible.
                  </p>
                  <p className="text-lg text-gray-600 mb-8">
                    As agent-to-agent communication becomes the norm, they will need a central discovery and 
                    interaction platform. We are creating that platform today, preparing for the connected AI future 
                    that's just around the corner.
                  </p>
                  <div className="bg-primary-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">What We're Building:</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        <span>Universal discovery protocol for AI agents</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        <span>Standardized agent-to-agent communication layer</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        <span>Marketplace for collaborative AI workflows</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        <span>Tools for developers to make their agents discoverable</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
}
