
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ReportManager } from './_components/report-manager';
import { getUserData } from '@/lib/userData';
import { getCurrentUser } from '@/lib/auth';
import type { UserStats } from '@/lib/stats';
import type { User } from '@/types';

export default function ReportPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<{ user: User, initialStats: UserStats } | null>(null);
  const router = useRouter();

  const loadReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const userData = await getUserData(currentUser.username);
      if (!userData?.baseStats) {
        console.error("User data or baseStats not found for:", currentUser.username);
        return;
      }
      
      setReportData({ user: currentUser, initialStats: userData.baseStats });

    } catch (error) {
      console.error("Failed to load report page data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  if (isLoading) {
    return (
       <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
           <p>Yükleniyor...</p>
       </main>
   );
  }

  if (!reportData) {
     return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <p>Kullanıcı istatistikleri yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
        </main>
    );
  }

  return <ReportManager user={reportData.user} initialStats={reportData.initialStats} />;
}
