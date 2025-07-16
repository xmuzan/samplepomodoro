
'use client';

import { useState, useEffect, useCallback } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { getGlobalBossData, getUserData, getBossDefinition, initializeBossDefinition } from '@/lib/userData';
import { BossManager } from './_components/boss-manager';
import type { User } from '@/types';
import { getCurrentUser } from '@/lib/auth';

export interface Boss {
  id: string;
  name: string;
  imageUrl: string;
  maxHp: number;
}

const BOSS_ID = 'netanyahu';

const defaultBoss: Boss = {
  id: BOSS_ID,
  name: 'Süper Domuz Netanyahu',
  imageUrl: '/domuzboss.png',
  maxHp: 100,
};

export default function BossPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pageData, setPageData] = useState<{
    user: User;
    initialUserStats: any;
    initialUserGold: number;
    initialBossHp: number;
    initialRespawnTime: number | null;
    currentBoss: Boss;
  } | null>(null);
  const router = useRouter();

  const loadBossData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const userData = await getUserData(currentUser.username);
      if (!userData || !userData.baseStats) {
        console.error("User data or baseStats not found for:", currentUser.username);
        return;
      }

      let currentBoss = await getBossDefinition(BOSS_ID);
      if (!currentBoss) {
        await initializeBossDefinition(BOSS_ID, defaultBoss);
        currentBoss = defaultBoss;
      }
      
      const bossData = await getGlobalBossData(currentBoss.id);

      const initialBossHp = bossData.hp !== undefined ? bossData.hp : currentBoss.maxHp;
      const initialRespawnTime = bossData.respawnTime && bossData.respawnTime > Date.now() ? bossData.respawnTime : null;

      setPageData({
        user: currentUser,
        initialUserStats: userData.baseStats,
        initialUserGold: userData.userGold || 0,
        initialBossHp,
        initialRespawnTime,
        currentBoss
      });

    } catch (error) {
      console.error("Failed to load boss page data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadBossData();
  }, [loadBossData]);
  
  useEffect(() => {
    // Listen for storage changes to re-fetch data if needed
    const handleStorageChange = () => {
      loadBossData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadBossData]);

  if (isLoading) {
    return (
      <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  if (!pageData) {
    return (
       <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
           <p>Kullanıcı veya boss verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
       </main>
   );
  }

  return (
    <BossManager 
        user={pageData.user}
        initialUserStats={pageData.initialUserStats}
        initialUserGold={pageData.initialUserGold}
        initialBossHp={pageData.initialBossHp}
        initialRespawnTime={pageData.initialRespawnTime}
        currentBoss={pageData.currentBoss}
    />
  );
}
