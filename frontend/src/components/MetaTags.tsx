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
  
  // Truncate description to 155 characters for optimal SEO
  const truncateDescription = (desc: string, maxLength: number = 155): string => {
    if (desc.length <= maxLength) return desc;
    return desc.substring(0, maxLength).trim() + '...';
  };
  
  const optimizedDescription = truncateDescription(description);
  
  // Use canonicalUrl as og:url to ensure they match
  const ogUrl = canonicalUrl || url;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={optimizedDescription} />
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
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content="AgentsPool" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={optimizedDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="author" content="AgentsPool" />
      <meta name="theme-color" content="#3b82f6" />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="shortcut icon" href="/favicon.png" />
      
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
