
'use client';
import { useState, useEffect, useCallback } from 'react';
import { FuturisticBorder } from '@/components/futuristic-border';
import { UserInfo } from './_components/user-info';
import { StatBars } from './_components/stat-bars';
import { Attributes } from './_components/attributes';
import { FooterActions } from './_components/footer-actions';
import { Separator } from '@/components/ui/separator';
import { shopItemsData } from '@/app/(protected)/shop/page';
import { getTitleForLevel } from '@/lib/titles';
import { getTierForLevel } from '@/lib/ranks';
import { type UserStats } from '@/lib/stats';
import { getCurrentUser } from '@/lib/auth';
import { getUserData, updateUserData } from '@/lib/userData';
import { type UserData } from '@/lib/userData';


import './profile.css';

const defaultUserData: UserData = {
    userGold: 150,
    avatarUrl: "https://placehold.co/100x100.png",
    level: 0,
    attributePoints: 0,
    stats: { str: 0, vit: 0, agi: 0, int: 0, per: 0 },
    baseStats: { hp: 100, mp: 100, ir: 100 },
    skillData: {},
    tasks: [],
    inventory: [],
};

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = getCurrentUser();

  const loadDataFromFirestore = useCallback(async () => {
    if (!currentUser?.username) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
      const data = await getUserData(currentUser.username);
      setUserData(data || defaultUserData);
    } catch (error) {
      console.error("Failed to load user data:", error);
      setUserData(defaultUserData);
    } finally {
        setIsLoading(false);
    }
  }, [currentUser?.username]);

  useEffect(() => {
    setIsMounted(true);
    loadDataFromFirestore();
  }, [loadDataFromFirestore]);

  // Effect to listen for storage changes from other tabs/windows
  useEffect(() => {
    if (!isMounted) return;

    const handleStorageChange = (event: StorageEvent) => {
        // A generic event listener, refetch data on any 'storage' event from our app
        loadDataFromFirestore();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [isMounted, loadDataFromFirestore]);

  const handleProfileUpdate = async (newUsername: string, newAvatarUrl: string) => {
    if (!currentUser?.username) return;
    await updateUserData(currentUser.username, { avatarUrl: newAvatarUrl });
    setUserData(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
    window.dispatchEvent(new Event('storage'));
  };
  
  const handleSpendPoint = async (statKey: keyof UserData['stats']) => {
    if (!currentUser?.username || !userData || userData.attributePoints <= 0) return;
    
    const newPoints = userData.attributePoints - 1;
    const newStats = { ...userData.stats, [statKey]: (userData.stats?.[statKey] || 0) + 1 };
    
    await updateUserData(currentUser.username, { 
        attributePoints: newPoints,
        stats: newStats
    });

    setUserData(prev => prev ? { ...prev, attributePoints: newPoints, stats: newStats } : null);
    window.dispatchEvent(new Event('storage'));
  };


  if (!isMounted || isLoading) {
    return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <p>Yükleniyor...</p>
        </main>
    );
  }

  if (!userData || !currentUser) {
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
              username={currentUser.username}
              avatarUrl={userData.avatarUrl}
              onProfileUpdate={handleProfileUpdate}
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
              onSpendPoint={handleSpendPoint}
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
