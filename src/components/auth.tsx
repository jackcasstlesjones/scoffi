'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check auth status on mount
    fetch('/api/auth/check')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
