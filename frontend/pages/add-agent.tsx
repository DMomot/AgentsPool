import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import MetaTags from '../src/components/MetaTags';
import { apiClient } from '../src/lib/api';
import { Category } from '../src/types';

export default function AddAgentPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    pricing_model: 'free',
    tags: '',
    capabilities: '',
    use_cases: '',
    url: '',
    api_endpoint: '',
    documentation_url: '',
    github_url: '',
    website_url: '',
    contact_email: '',
    logo_url: '',
    screenshots: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert string fields to arrays where needed
      const submitData = {
        name: formData.name,
        description: formData.description,
        category_id: parseInt(formData.category_id),
        pricing_model: formData.pricing_model,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        capabilities: formData.capabilities.split(',').map(cap => cap.trim()).filter(cap => cap),
        use_cases: formData.use_cases.split(',').map(uc => uc.trim()).filter(uc => uc),
        url: formData.url || undefined,
        api_endpoint: formData.api_endpoint || undefined,
        documentation_url: formData.documentation_url || undefined,
        github_url: formData.github_url || undefined,
        website_url: formData.website_url || undefined,
        contact_email: formData.contact_email,
        logo_url: formData.logo_url || undefined,
        screenshots: formData.screenshots.split(',').map(url => url.trim()).filter(url => url)
      };

      // Send data to API
      const response = await apiClient.createAgent(submitData);
      
      // Show success message and redirect
      alert(`Agent successfully added! ${response.message}`);
      router.push('/catalog');
    } catch (error) {
      console.error('Error submitting agent:', error);
      alert('An error occurred while adding the agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MetaTags
        title="Add Agent - AgentsPool"
        description="Add your AI agent to the AgentsPool marketplace. Share your solution with the developer and user community."
        keywords="add AI agent, publish agent, AI marketplace, developers, artificial intelligence"
        url="https://agentspool.ai/add-agent"
        canonicalUrl="https://agentspool.ai/add-agent"
        noIndex={true}
      />

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Add AI Agent</h1>
            <p className="text-lg text-gray-600">
              Share your AI solution with the community. All agents undergo moderation before publication.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="For example: ChatGPT Assistant"
                  />
                </div>

                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    required
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Detailed description of your AI agent's capabilities and features..."
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pricing_model" className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Model *
                  </label>
                  <select
                    id="pricing_model"
                    name="pricing_model"
                    value={formData.pricing_model}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="subscription">Subscription</option>
                    <option value="one_time">One-time Payment</option>
                    <option value="usage_based">Usage-based</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Features and Applications</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="AI, chatbot, automation (separate with commas)"
                  />
                </div>

                <div>
                  <label htmlFor="capabilities" className="block text-sm font-medium text-gray-700 mb-2">
                    Key Capabilities
                  </label>
                  <textarea
                    id="capabilities"
                    name="capabilities"
                    rows={3}
                    value={formData.capabilities}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Text generation, data analysis, image processing (separate with commas)"
                  />
                </div>

                <div>
                  <label htmlFor="use_cases" className="block text-sm font-medium text-gray-700 mb-2">
                    Use Cases
                  </label>
                  <textarea
                    id="use_cases"
                    name="use_cases"
                    rows={3}
                    value={formData.use_cases}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Customer support, content creation, document analysis (separate with commas)"
                  />
                </div>
              </div>
            </div>

            {/* Links and Resources */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Links and Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    Demo URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://demo.example.com"
                  />
                </div>

                <div>
                  <label htmlFor="api_endpoint" className="block text-sm font-medium text-gray-700 mb-2">
                    API Endpoint
                  </label>
                  <input
                    type="url"
                    id="api_endpoint"
                    name="api_endpoint"
                    value={formData.api_endpoint}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://api.example.com"
                  />
                </div>

                <div>
                  <label htmlFor="documentation_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Documentation
                  </label>
                  <input
                    type="url"
                    id="documentation_url"
                    name="documentation_url"
                    value={formData.documentation_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://docs.example.com"
                  />
                </div>

                <div>
                  <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Repository
                  </label>
                  <input
                    type="url"
                    id="github_url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div>
                  <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website_url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    required
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Media Materials</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label htmlFor="screenshots" className="block text-sm font-medium text-gray-700 mb-2">
                    Screenshots (URLs)
                  </label>
                  <textarea
                    id="screenshots"
                    name="screenshots"
                    rows={3}
                    value={formData.screenshots}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/screenshot1.png, https://example.com/screenshot2.png (separate with commas)"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" className="text-primary-600 hover:text-primary-700 underline">
                      terms of use
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                      privacy policy
                    </a>
                    . I understand that my agent will undergo moderation before publication.
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit for Moderation'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-12 bg-primary-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Moderation Process</h4>
                <p>All agents undergo review within 24-48 hours. We check functionality, security, and compliance with our standards.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Agent Requirements</h4>
                <p>The agent must be functional, have a clear description, and match the selected category. Malicious or illegal solutions are prohibited.</p>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/help"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Detailed guide for adding agents →
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
