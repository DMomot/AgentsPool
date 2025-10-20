import Link from 'next/link';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import MetaTags from '../src/components/MetaTags';

export default function Custom404() {
  return (
    <>
      <MetaTags
        title="Page Not Found - 404 Error"
        description="The page you are looking for does not exist. Browse our AI agents catalog or return to the homepage."
        noIndex={true}
      />
      
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <h1 className="text-9xl font-bold text-primary-600">404</h1>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
              <p className="mt-4 text-lg text-gray-600">
                Sorry, we couldn't find the page you're looking for.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Go to Homepage
              </Link>
              
              <Link
                href="/catalog"
                className="inline-block w-full bg-white text-primary-600 px-6 py-3 rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors font-medium"
              >
                Browse AI Agents
              </Link>
            </div>
            
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Need help?{' '}
                <Link href="/help" className="text-primary-600 hover:text-primary-700 font-medium">
                  Visit our Help Center
                </Link>
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

