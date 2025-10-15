export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  slug: string;
  created_at: string;
}

export interface Agent {
  id: number;
  name: string;
  description: string;
  short_description?: string;
  category_id: number;
  author?: string;
  version: string;
  price: number;
  is_free: boolean;
  rating: number;
  downloads_count: number;
  tags?: string[];
  capabilities?: string[];
  use_cases?: string[];
  url?: string;
  documentation_url?: string;
  github_url?: string;
  api_endpoint?: string;
  a2a?: string;
  img_url?: string;
  model_info?: Record<string, any>;
  is_active: boolean;
  featured: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  // Additional fields from API
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  screenshots?: string[];
  pricing_model?: string;
}

export interface AgentList {
  id: number;
  name: string;
  short_description?: string;
  author?: string;
  price: number;
  is_free: boolean;
  rating: number;
  downloads_count: number;
  tags?: string[];
  featured: boolean;
  slug: string;
  category?: Category;
}

export interface Review {
  id: number;
  agent_id: number;
  user_name: string;
  user_email: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified: boolean;
  created_at: string;
}

export interface AgentSearchParams {
  q?: string;
  category_id?: number;
  is_free?: boolean;
  min_rating?: number;
  tags?: string[];
  sort_by?: 'rating' | 'downloads' | 'created_at' | 'name';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AgentSearchResponse {
  agents: AgentList[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
