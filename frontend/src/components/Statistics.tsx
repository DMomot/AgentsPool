'use client';

export default function Statistics() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Join the <span className="text-primary-600">AI Revolution</span>
          </h2>
          <p className="text-lg text-gray-600">
            Thousands of agents, unlimited possibilities
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">1,400+</div>
            <div className="text-gray-600">AI agents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">22</div>
            <div className="text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">A2A Ready</div>
            <div className="text-gray-600">Agent-to-agent discovery</div>
          </div>
        </div>
      </div>
    </section>
  );
}

