import { useState } from 'react';

interface OpenRouterAssistantProps {
  agentData: any;
  editedAgent: any;
  onSuggestionApply: (field: string, value: any) => void;
  onReset?: () => void;
}

interface Suggestion {
  field: string;
  value: any;
  reason: string;
  confidence: number;
  applied?: boolean;
}

export default function OpenRouterAssistant({ agentData, editedAgent, onSuggestionApply, onReset }: OpenRouterAssistantProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedContent, setParsedContent] = useState<any>(null);

  const resetSuggestions = () => {
    setSuggestions([]);
    setError(null);
    setParsedContent(null);
    if (onReset) {
      onReset();
    }
  };

  const generateSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, parse the website to get additional context
      console.log('🔍 Parsing website for additional context...');
      let websiteData = null;
      
      try {
        const parseResponse = await fetch('/api/parse-website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: agentData.url }),
        });
        
        if (parseResponse.ok) {
          const parseResult = await parseResponse.json();
          websiteData = parseResult.data;
          setParsedContent(websiteData);
          console.log('✅ Website parsed successfully:', websiteData?.title);
          console.log('📄 Parsed content set:', websiteData);
        } else {
          const errorText = await parseResponse.text();
          console.warn('⚠️ Website parsing failed:', parseResponse.status, errorText);
        }
      } catch (parseError) {
        console.warn('⚠️ Website parsing error:', parseError);
      }

      const prompt = `
Analyze this AI agent data and suggest improvements for better categorization and tagging:

${websiteData ? `
PARSED WEBSITE DATA:
Title: ${websiteData.title}
Description: ${websiteData.description}
Main Content: ${websiteData.main_content?.substring(0, 2000)}...
Headings: ${websiteData.headings?.join(', ')}
Features: ${websiteData.features?.join(', ')}
Keywords: ${websiteData.keywords?.join(', ')}
Technology Stack: ${websiteData.technology_stack?.join(', ')}
Pricing Info: ${JSON.stringify(websiteData.pricing_info)}

` : ''}

ORIGINAL DATA:
Title: ${agentData.title}
Description: ${agentData.description || agentData.main_text}
URL: ${agentData.url}
Keywords: ${agentData.keywords?.join(', ') || 'none'}
H2 Headings: ${agentData.h2_headings?.join(', ') || 'none'}

CURRENT EDITED DATA:
Name: ${editedAgent.name}
Category ID: ${editedAgent.category_id}
Description: ${editedAgent.description}
Tags: ${editedAgent.tags?.join(', ') || 'none'}
Capabilities: ${editedAgent.capabilities?.join(', ') || 'none'}

AVAILABLE CATEGORIES:
1. Content & Media
2. Business & Productivity  
3. Development & Coding
4. AI Platforms & Infrastructure
5. Marketing & Sales
6. Personal & Lifestyle
7. Customer Support & HR
8. Specialized Industries
9. Web & Mobile
10. LLM & AI Assistants
11. Blockchain & Web3
12. Workflow
13. Security & Infrastructure
14. Other & Miscellaneous

Please provide suggestions in JSON format:
{
  "suggestions": [
    {
      "field": "category_id",
      "value": 3,
      "reason": "Based on keywords like 'code', 'development', this fits Development & Coding better",
      "confidence": 0.9
    },
    {
      "field": "tags", 
      "value": ["ai", "automation", "productivity"],
      "reason": "These tags better represent the agent's core functionality",
      "confidence": 0.8
    },
    {
      "field": "short_description",
      "value": "AI-powered development assistant for code generation",
      "reason": "More concise and focused short description for better UX",
      "confidence": 0.7
    },
    {
      "field": "capabilities",
      "value": ["Code generation", "Bug detection", "Documentation"],
      "reason": "Key capabilities identified from the content analysis",
      "confidence": 0.8
    }
  ]
}

IMPORTANT RULES:
1. You CAN suggest changes to "description" field to improve clarity and marketing appeal
2. Focus on category selection based on functionality
3. Suggest relevant and SEO-friendly tags
4. Improve short_description (max 200 chars) and description for better user engagement
5. Add missing capabilities if identified
6. Suggest better agent name if current is too generic - KEEP NAMES SHORT (1-2 words max)
7. Agent names should be concise brand names, not descriptive phrases

GOOD NAME EXAMPLES:
- "SimplAI" (not "SimplAI Scalable Secure Agentic AI Platform")
- "ChatGPT" (not "ChatGPT Advanced AI Assistant")
- "Claude" (not "Claude AI Assistant by Anthropic")
- "Perplexity" (not "Perplexity AI Search Engine")

BAD NAME EXAMPLES:
- "AI-Powered Customer Service Automation Platform"
- "Advanced Machine Learning Content Generator"
- "Intelligent Business Process Automation Tool"
`;

      const response = await fetch('/api/openrouter-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError('Failed to get AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (suggestionIndex: number) => {
    const suggestion = suggestions[suggestionIndex];
    let processedValue = suggestion.value;
    
    // Auto-process name to be 1-2 words
    if (suggestion.field === 'name' && typeof suggestion.value === 'string') {
      const words = suggestion.value.trim().split(/\s+/);
      processedValue = words.slice(0, 2).join(' ');
      
      // Log the transformation if it was shortened
      if (words.length > 2) {
        console.log(`🔧 AI suggestion name shortened from "${suggestion.value}" to "${processedValue}"`);
      }
    }
    
    onSuggestionApply(suggestion.field, processedValue);
    
    // Mark suggestion as applied
    setSuggestions(prev => prev.map((s, index) => 
      index === suggestionIndex ? { ...s, applied: true } : s
    ));
  };

  const getCategoryName = (categoryId: number) => {
    const categories = {
      1: 'Content & Media',
      2: 'Business & Productivity',
      3: 'Development & Coding',
      4: 'AI Platforms & Infrastructure',
      5: 'Marketing & Sales',
      6: 'Personal & Lifestyle',
      7: 'Customer Support & HR',
      8: 'Specialized Industries',
      9: 'Web & Mobile',
      10: 'LLM & AI Assistants',
      11: 'Blockchain & Web3',
      12: 'Workflow',
      13: 'Security & Infrastructure',
      14: 'Other & Miscellaneous'
    };
    return categories[categoryId as keyof typeof categories] || 'Unknown';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-900">OpenRouter AI Assistant</h4>
        </div>
        
        <button
          onClick={generateSuggestions}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            '✨ Get AI Suggestions'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 text-sm">AI Suggestions:</h5>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {suggestion.field.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {getConfidenceText(suggestion.confidence)} ({Math.round(suggestion.confidence * 100)}%)
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {suggestion.field === 'category_id' ? (
                      <span className="font-medium text-purple-700">
                        {getCategoryName(suggestion.value)}
                      </span>
                    ) : suggestion.field === 'tags' || suggestion.field === 'capabilities' ? (
                      <div className="flex flex-wrap gap-1">
                        {suggestion.value.map((item: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : suggestion.field === 'name' && typeof suggestion.value === 'string' ? (
                      <div>
                        <span className="font-medium">{suggestion.value.trim().split(/\s+/).slice(0, 2).join(' ')}</span>
                        {suggestion.value.trim().split(/\s+/).length > 2 && (
                          <div className="text-xs text-orange-600 mt-1">
                            ⚠️ Will be shortened to 1-2 words when applied
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="font-medium">{suggestion.value}</span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">{suggestion.reason}</p>
                </div>
                
                <button
                  onClick={() => applySuggestion(index)}
                  disabled={suggestion.applied}
                  className={`ml-3 px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                    suggestion.applied 
                      ? 'bg-green-600 text-white cursor-default' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {suggestion.applied ? '✓ Applied' : 'Apply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {suggestions.length === 0 && !loading && !error && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Click "Get AI Suggestions" to analyze this agent with OpenRouter AI</p>
        </div>
      )}

      {/* Parsed Content Display */}
      {parsedContent && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🔍</span>
            Parsed Website Content
          </h4>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {/* Title */}
            {parsedContent.title && (
              <div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Title:</span>
                <p className="text-sm text-gray-800 mt-1">{parsedContent.title}</p>
              </div>
            )}

            {/* Description */}
            {parsedContent.description && (
              <div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Meta Description:</span>
                <p className="text-sm text-gray-800 mt-1">{parsedContent.description}</p>
              </div>
            )}

            {/* Main Headings */}
            {parsedContent.headings && parsedContent.headings.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Main Headings:</span>
                <div className="mt-1 space-y-1">
                  {parsedContent.headings.slice(0, 5).map((heading: string, index: number) => (
                    <p key={index} className="text-sm text-gray-700">• {heading}</p>
                  ))}
                  {parsedContent.headings.length > 5 && (
                    <p className="text-xs text-gray-500">... and {parsedContent.headings.length - 5} more</p>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            {parsedContent.features && parsedContent.features.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Detected Features:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {parsedContent.features.slice(0, 8).map((feature: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {parsedContent.keywords && parsedContent.keywords.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Keywords:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {parsedContent.keywords.slice(0, 10).map((keyword: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content Preview */}
            {parsedContent.main_content && (
              <div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Content Preview:</span>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                  {parsedContent.main_content.substring(0, 300)}
                  {parsedContent.main_content.length > 300 && '...'}
                </p>
              </div>
            )}

            {/* Technology Stack */}
            {parsedContent.technology_stack && parsedContent.technology_stack.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Technology Stack:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {parsedContent.technology_stack.map((tech: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
