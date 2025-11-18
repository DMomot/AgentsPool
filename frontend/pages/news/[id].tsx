import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Header from '../../src/components/Header';
import Footer from '../../src/components/Footer';
import MetaTags from '../../src/components/MetaTags';
import ExternalLink from '../../src/components/ExternalLink';
import { apiClient } from '../../src/lib/api';
import { NewsArticle } from '../../src/types';

interface NewsArticlePageProps {
  article: NewsArticle;
}

// Helper function for decoding HTML entities (works on both server and client)
const decodeHtmlEntities = (text: string) => {
  if (typeof window === 'undefined') {
    // Server-side: use regex to decode common entities
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&apos;/g, "'");
  }
  // Client-side: use textarea method
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export default function NewsArticlePage({ article }: NewsArticlePageProps) {
  const router = useRouter();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags
        title={`${article.title} - AgentsPool News`}
        description={article.description || article.title}
        keywords={`AI news, ${article.tags?.join(', ') || 'artificial intelligence'}`}
        url={`https://agentspool.ai/news/${article.id}`}
        canonicalUrl={`https://agentspool.ai/news/${article.id}`}
        type="article"
      />

      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <a href="/" className="hover:text-primary-600 transition-colors">Home</a>
            </li>
            <li>
              <span className="mx-2">›</span>
            </li>
            <li>
              <a href="/news" className="hover:text-primary-600 transition-colors">News</a>
            </li>
            <li>
              <span className="mx-2">›</span>
            </li>
            <li className="text-gray-900 font-medium truncate">
              {article.title.slice(0, 50)}...
            </li>
          </ol>
        </nav>

        {/* Article */}
        <article className="bg-white rounded-lg shadow-sm p-8">
          {/* Header Image */}
          {article.img_url && (
            <div className="mb-8">
              <img
                src={article.img_url}
                alt={decodeHtmlEntities(article.title)}
                className="w-full h-auto max-h-[500px] object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/agents_pool.webp';
                }}
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {decodeHtmlEntities(article.title)}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
            <span className="font-medium text-blue-600">{article.source_name}</span>
            <span>•</span>
            <time>{formatDate(article.published_at)}</time>
          </div>

          {/* Description */}
          {article.description && (
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                {decodeHtmlEntities(article.description)}
              </p>
            </div>
          )}

          {/* Content */}
          {article.content && (
            <div className="prose prose-lg max-w-none mb-8">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {decodeHtmlEntities(article.content)}
              </div>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags
                .map((tag) => {
                  const parts = tag.split('|');
                  if (parts.length === 3) {
                    return parts[1];
                  }
                  return null;
                })
                .filter((tagName) => tagName !== null)
                .map((tagName, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                  >
                    {tagName}
                  </span>
                ))}
            </div>
          )}

          {/* Read More Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <ExternalLink
              href={article.link}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium text-base rounded-lg hover:bg-blue-700 transition-colors"
            >
              Read Full Article
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </ExternalLink>
            <p className="text-sm text-gray-500 mt-3">
              Continue reading on {article.source_domain}
            </p>
          </div>
        </article>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to News
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const article = await apiClient.getNewsArticle(parseInt(id));

    return {
      props: {
        article,
      },
    };
  } catch (error) {
    console.error('Error fetching news article:', error);
    return {
      notFound: true,
    };
  }
};

