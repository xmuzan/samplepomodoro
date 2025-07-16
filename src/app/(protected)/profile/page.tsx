
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FuturisticBorder } from '@/components/futuristic-border';
import { UserInfo } from './_components/user-info';
import { StatBars } from './_components/stat-bars';
import { Attributes } from './_components/attributes';
import { FooterActions } from './_components/footer-actions';
import { Separator } from '@/components/ui/separator';
import { shopItemsData } from '@/app/(protected)/shop/page';
import { getTitleForLevel } from '@/lib/titles';
import { getTierForLevel } from '@/lib/ranks';
import { getCurrentUser } from '@/lib/auth';
import { getUserData, type UserData } from '@/lib/userData';
import type { User } from '@/types';

import './profile.css';

// This is now a Client Component
export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      const data = await getUserData(currentUser.username);
      if (data) {
        setUserData(data);
      }
    } catch(error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);
  
  useEffect(() => {
    // Listen for storage changes to re-fetch data
    const handleStorageChange = (event: StorageEvent) => {
      // A simple way to trigger re-fetch on any relevant change
      if(event.key === 'currentUser' || event.key === 'user-data-updated') {
        loadProfileData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadProfileData]);

  if (isLoading) {
    return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <p>Yükleniyor...</p>
        </main>
    );
  }

  if (!userData || !user) {
    return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <p>Kullanıcı verisi bulunamadı.</p>
        </main>
    );
  }

  const userTitle = getTitleForLevel(userData.level);
  const userTier = getTierForLevel(userData.level);

  return (
    <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
      <div className="max-w-4xl mx-auto">
        <FuturisticBorder>
          <div className="p-4 md:p-6 profile-card-container bg-background/90 backdrop-blur-lg">
            <UserInfo 
              level={userData.level}
              tier={userTier}
              job={userTitle.job}
              title={userTitle.title}
              username={user.username}
              avatarUrl={userData.avatarUrl}
            />

            <Separator className="my-4 bg-border/20" />

            <StatBars 
              hp={{current: userData.baseStats.hp, max: 100}}
              mp={{current: userData.baseStats.mp, max: 100}}
              ir={{current: userData.baseStats.ir, max: 100}}
            />

            <Separator className="my-4 bg-border/20" />

            <Attributes 
              stats={userData.stats}
              attributePoints={userData.attributePoints}
            />

             <Separator className="my-4 bg-border/20" />

            <FooterActions 
              gold={userData.userGold} 
              shopItems={shopItemsData}
              availablePoints={userData.attributePoints}
            />
          </div>
        </FuturisticBorder>
      </div>
    </main>
  );
}
