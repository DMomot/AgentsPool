import Head from 'next/head';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title = 'AgentsPool - AI Agents Catalog',
  description = 'Find the best AI agents for your business. Catalog of verified artificial intelligence solutions with reviews and ratings.',
  keywords = 'AI agents, artificial intelligence, automation, chatbots, machine learning',
  image = 'https://agentspool.ai/og-image.jpg',
  url = 'https://agentspool.ai',
  type = 'website',
  noIndex = false,
  canonicalUrl
}) => {
  const fullTitle = title.includes('AgentsPool') ? title : `${title} | AgentsPool`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="AgentsPool" />
      <meta property="og:locale" content="ru_RU" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="author" content="AgentsPool" />
      <meta name="theme-color" content="#3b82f6" />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="alternate icon" href="/favicon.svg" />
      
      {/* Web App Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* Structured Data - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AgentsPool",
            "url": "https://agentspool.ai",
            "logo": "https://agentspool.ai/logo.png",
            "description": "AI agents catalog for business",
            "sameAs": []
          })
        }}
      />
    </Head>
  );
};

export default MetaTags;
