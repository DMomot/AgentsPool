import { Agent, AgentList, AgentSearchParams, AgentSearchResponse, Category, Review } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/v1/categories');
  }

  async getCategoryStats(): Promise<{
    category_stats: Record<number, number>;
    total_agents: number;
    total_categories: number;
  }> {
    return this.request('/api/v1/categories/stats');
  }

  // Agents
  async searchAgents(params: AgentSearchParams = {}): Promise<AgentSearchResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/agents${queryString ? `?${queryString}` : ''}`;
    
    return this.request<AgentSearchResponse>(endpoint);
  }

  async getFeaturedAgents(limit: number = 6): Promise<AgentList[]> {
    return this.request<AgentList[]>(`/api/v1/agents/featured?limit=${limit}`);
  }

  async getAgent(id: number): Promise<Agent> {
    return this.request<Agent>(`/api/v1/agents/${id}`);
  }

  async getAgentReviews(agentId: number, limit: number = 10): Promise<Review[]> {
    return this.request<Review[]>(`/api/v1/agents/${agentId}/reviews?limit=${limit}`);
  }

  async createAgent(agentData: {
    name: string;
    description: string;
    category_id: number;
    price: number;
    pricing_model: string;
    tags: string[];
    capabilities: string[];
    use_cases: string[];
    url?: string;
    api_endpoint?: string;
    documentation_url?: string;
    github_url?: string;
    website_url?: string;
    contact_email: string;
    logo_url?: string;
    screenshots: string[];
  }): Promise<{
    id: number;
    message: string;
    status: string;
  }> {
    return this.request('/api/v1/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  // Reviews
  async createReview(review: Omit<Review, 'id' | 'is_verified' | 'created_at'>): Promise<Review> {
    return this.request<Review>('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
