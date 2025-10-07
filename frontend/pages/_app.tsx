import type { AppProps } from 'next/app';
import '../styles/globals.css';
import MetaTags from '../src/components/MetaTags';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <MetaTags />
      <Component {...pageProps} />
    </>
  );
}
