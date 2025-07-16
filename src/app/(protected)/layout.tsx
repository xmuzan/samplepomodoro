
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';
import { Navbar } from '@/components/navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyUser = () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.replace('/login');
      } else {
        setUser(currentUser);
        setIsVerifying(false);
      }
    };
    
    verifyUser();

    const handleStorageChange = () => {
        const updatedUser = getCurrentUser();
        if (!updatedUser) {
            router.replace('/login');
        } else {
            setUser(updatedUser);
        }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [router]);

  if (isVerifying) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-transparent">
            <p>Yükleniyor...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-foreground md:flex-row">
        <Navbar />
        {children}
    </div>
  );
}
