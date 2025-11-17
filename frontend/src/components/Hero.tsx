'use client';

import { useState, useEffect } from 'react';
import AISearchChat from './AISearchChat';
import { apiClient } from '../lib/api';

export default function Hero() {
  const [stats, setStats] = useState<{ total_agents: number; new_agents_24h: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getAgentsStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching agents stats:', err);
      }
    };

    fetchStats();
  }, []);

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
          
          {stats && (
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-sm md:text-base text-gray-700">
                <span className="font-semibold text-primary-600">{stats.total_agents.toLocaleString()}</span> AI agents available
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="text-sm md:text-base text-gray-700">
                <span className="font-semibold text-green-600">{stats.new_agents_24h}</span> added in last 90 days
              </div>
            </div>
          )}
          
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
