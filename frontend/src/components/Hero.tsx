'use client';

import AISearchChat from './AISearchChat';

export default function Hero() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find the perfect{' '}
            <span className="text-primary-600">AI agent</span>
            <br />
            for your tasks
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive catalog of AI agents for business automation, 
            content creation, data analysis and much more. 
            A universal directory where both humans and AI agents can discover 
            and connect with specialized autonomous solutions.
          </p>
        </div>

        {/* AI Search Chat */}
        <div className="w-full mx-auto">
          <AISearchChat />
        </div>
      </div>
    </div>
  );
}
