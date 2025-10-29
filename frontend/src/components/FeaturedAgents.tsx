'use client';

import { useEffect, useState } from 'react';
import { AgentList } from '../types';
import { apiClient } from '../lib/api';
import AgentCard from './AgentCard';
import Link from 'next/link';

export default function FeaturedAgents() {
  const [agents, setAgents] = useState<AgentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomAgents = async () => {
      try {
        setLoading(true);
        const response = await apiClient.searchAgents({ limit: 20 });
        const allAgents = response.agents;
        
        // Select 3 random agents
        const shuffled = [...allAgents].sort(() => Math.random() - 0.5);
        const randomAgents = shuffled.slice(0, 3);
        
        setAgents(randomAgents);
      } catch (err) {
        setError('Failed to load agents');
        console.error('Error fetching agents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomAgents();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Discover AI Agents
            </h2>
            <p className="text-lg text-gray-600">
              Explore random AI agents from our catalog
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Loading Error
            </h2>
            <p className="text-red-600">{error}</p>
            <Link href="/catalog" className="mt-4 btn-primary inline-block">
              View Catalog
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Discover AI Agents
          </h2>
          <p className="text-lg text-gray-600">
            Explore random AI agents from our catalog
          </p>
        </div>

        {agents.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>

            <div className="text-center">
              <Link href="/catalog" className="btn-primary text-lg px-8 py-3">
                View All Agents
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
