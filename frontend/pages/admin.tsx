import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Decoy page - redirects to home
export default function AdminDecoy() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}

