import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import MetaTags from '../src/components/MetaTags';

export default function AboutPage() {
  return (
    <>
      <MetaTags
        title="About Us - AgentsPool"
        description="Learn more about AgentsPool - the leading AI agents marketplace. Our mission, team, and vision for the future of artificial intelligence."
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
                We are creating a future where artificial intelligence is accessible to everyone. 
                AgentsPool is a marketplace of the best AI agents for solving any tasks.
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
                    We believe that artificial intelligence should be accessible and useful for everyone. 
                    Our goal is to create an ecosystem where developers can share their AI solutions, 
                    and users can easily find the perfect tools for their tasks.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p className="text-gray-600">Democratization of access to AI technologies</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p className="text-gray-600">Support for innovative developers</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p className="text-gray-600">Creating a safe and reliable ecosystem</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                  {/* Placeholder for mission photo */}
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p className="text-sm">Mission photo placeholder</p>
                  </div>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                  <div className="text-gray-600">AI Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">50k+</div>
                  <div className="text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">100+</div>
                  <div className="text-gray-600">Developers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
                  <div className="text-gray-600">Support</div>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
                <p className="text-lg text-gray-600">Experts in AI and technology</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Team Member 1 */}
                <div className="text-center">
                  <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Alex Johnson</h3>
                  <p className="text-primary-600 mb-2">CEO & Founder</p>
                  <p className="text-gray-600 text-sm">15+ years in AI and machine learning. Previously worked at Google and OpenAI.</p>
                </div>

                {/* Team Member 2 */}
                <div className="text-center">
                  <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Maria Smith</h3>
                  <p className="text-primary-600 mb-2">CTO</p>
                  <p className="text-gray-600 text-sm">Expert in distributed systems architecture. Master of Computer Science from MIT.</p>
                </div>

                {/* Team Member 3 */}
                <div className="text-center">
                  <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">David Wilson</h3>
                  <p className="text-primary-600 mb-2">Head of Product</p>
                  <p className="text-gray-600 text-sm">UX/UI specialist and product strategy expert. 10+ years in technology startups.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
                <p className="text-lg text-gray-600">The principles that guide us</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality</h3>
                  <p className="text-gray-600">We carefully test every AI agent to guarantee high quality and reliability.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Community</h3>
                  <p className="text-gray-600">We build an open community of developers and users of AI technologies.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation</h3>
                  <p className="text-gray-600">We constantly implement new technologies and approaches to improve user experience.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Vision Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                  {/* Placeholder for vision photo */}
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <p className="text-sm">Место для фото видения</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Наше видение</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Мы видим будущее, где искусственный интеллект станет неотъемлемой частью повседневной жизни каждого человека. 
                    AgentsPool станет мостом между сложными AI технологиями и простыми человеческими потребностями.
                  </p>
                  <p className="text-lg text-gray-600 mb-8">
                    К 2030 году мы планируем стать ведущей платформой для AI агентов в мире, 
                    объединяющей миллионы пользователей и тысячи разработчиков.
                  </p>
                  <div className="bg-primary-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Наши цели на 2024-2025:</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        <span>Запуск 1000+ проверенных AI агентов</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        <span>Привлечение 100k+ активных пользователей</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        <span>Создание API для интеграции с популярными платформами</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        <span>Запуск программы для разработчиков</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary-600">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to join the AI future?</h2>
              <p className="text-xl text-primary-100 mb-8">
                Become part of the AgentsPool community today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Get Started
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                  Contact Us
                </button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
