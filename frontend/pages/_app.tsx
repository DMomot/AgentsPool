import type { AppProps } from 'next/app';
import Script from 'next/script';
import '../styles/globals.css';
import MetaTags from '../src/components/MetaTags';

const GA_TRACKING_ID = 'G-EDQ42E76WB';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `,
        }}
      />
      
      <MetaTags />
      <Component {...pageProps} />
    </>
  );
}
