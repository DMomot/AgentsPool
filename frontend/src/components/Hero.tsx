'use client';

import AISearchChat from './AISearchChat';

export default function Hero() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Not sure what you need?
            </h2>
            <p className="text-lg text-gray-600">
              Describe your task and let AI find the perfect agents for you
            </p>
          </div>
          <AISearchChat />
        </div>
      </div>
    </div>
  );
}
