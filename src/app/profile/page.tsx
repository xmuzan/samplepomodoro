
'use client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { FuturisticBorder } from '@/components/futuristic-border';
import { UserInfo } from './_components/user-info';
import { StatBars } from './_components/stat-bars';
import { Attributes } from './_components/attributes';
import { FooterActions } from './_components/footer-actions';
import { Separator } from '@/components/ui/separator';
import { shopItemsData } from '@/app/shop/page';
import { SKILL_CATEGORIES } from '@/lib/skills';
import { getTitleForLevel } from '@/lib/titles';
import { getTierForLevel } from '@/lib/ranks';
import { getStats, type UserStats } from '@/lib/stats';


import './profile.css';

const defaultUsername = "Sung Jin-Woo";
const defaultAvatarUrl = "https://placehold.co/100x100.png";
const defaultStatsData = { str: 0, vit: 0, agi: 0, int: 0, per: 0 };
const defaultSkillData = Object.keys(SKILL_CATEGORIES).reduce((acc, key) => {
    if (key !== 'other') {
      acc[key as keyof typeof SKILL_CATEGORIES] = { completedTasks: 0, rankIndex: 0 };
    }
    return acc;
  }, {} as Record<string, { completedTasks: number; rankIndex: number }>);


export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States for all user data
  const [gold, setGold] = useState(150);
  const [username, setUsername] = useState(defaultUsername);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl);
  const [level, setLevel] = useState(0);
  const [attributePoints, setAttributePoints] = useState(0);
  const [stats, setStats] = useState(defaultStatsData);
  const [baseStats, setBaseStats] = useState<UserStats>({ hp: 100, mp: 100, ir: 100 });


  const loadDataFromStorage = () => {
    try {
      const storedGold = localStorage.getItem('userGold');
      setGold(storedGold ? JSON.parse(storedGold) : 150);
    } catch {
      setGold(150);
    }

    try {
      const storedUsername = localStorage.getItem('username');
      setUsername(storedUsername ? JSON.parse(storedUsername) : defaultUsername);
    } catch {
       setUsername(defaultUsername);
    }
    
    try {
      const storedAvatarUrl = localStorage.getItem('avatarUrl');
      setAvatarUrl(storedAvatarUrl ? JSON.parse(storedAvatarUrl) : defaultAvatarUrl);
    } catch {
        setAvatarUrl(defaultAvatarUrl);
    }

    try {
      const storedLevel = localStorage.getItem('level');
      setLevel(storedLevel ? JSON.parse(storedLevel) : 0);
    } catch {
        setLevel(0);
    }

    try {
      const storedAttributePoints = localStorage.getItem('attributePoints');
      setAttributePoints(storedAttributePoints ? JSON.parse(storedAttributePoints) : 0);
    } catch {
        setAttributePoints(0);
    }
      
    try {
      const storedStats = localStorage.getItem('stats');
      setStats(storedStats ? JSON.parse(storedStats) : defaultStatsData);
    } catch {
        setStats(defaultStatsData);
    }

    try {
        const storedSkillData = localStorage.getItem('skillData');
        if (!storedSkillData) {
            localStorage.setItem('skillData', JSON.stringify(defaultSkillData));
        }
    } catch {
        localStorage.setItem('skillData', JSON.stringify(defaultSkillData));
    }

    setBaseStats(getStats());
  };

  // Effect to load data from localStorage on mount
  useEffect(() => {
    loadDataFromStorage();
    setIsMounted(true);
  }, []);

  // Effect to listen for storage changes from other tabs/windows
  useEffect(() => {
    if (!isMounted) return;

    const handleStorageChange = (event: StorageEvent) => {
        if ([
          'userGold', 'username', 'avatarUrl', 'level', 
          'attributePoints', 'stats', 'skillData', 'tasksCompletedThisLevel', 
          'tasksRequiredForNextLevel', 'baseStats'
        ].includes(event.key || '')) {
          loadDataFromStorage();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [isMounted]);

  const handleProfileUpdate = (newUsername: string, newAvatarUrl: string) => {
    setUsername(newUsername);
    setAvatarUrl(newAvatarUrl);
    localStorage.setItem('username', JSON.stringify(newUsername));
    localStorage.setItem('avatarUrl', JSON.stringify(newAvatarUrl));
    window.dispatchEvent(new Event('storage'));
  };
  
  const handleSpendPoint = (statKey: keyof typeof stats) => {
    if (attributePoints > 0) {
      const newPoints = attributePoints - 1;
      const newStats = { ...stats, [statKey]: stats[statKey] + 1 };
      
      setAttributePoints(newPoints);
      setStats(newStats);
      
      localStorage.setItem('attributePoints', JSON.stringify(newPoints));
      localStorage.setItem('stats', JSON.stringify(newStats));
      window.dispatchEvent(new Event('storage'));
    }
  };


  if (!isMounted) {
    return (
        <div className="flex min-h-screen flex-col text-foreground md:flex-row">
            <Navbar />
            <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
                {/* You can add a skeleton loader here if you want */}
            </main>
        </div>
    );
  }

  const userTitle = getTitleForLevel(level);
  const userTier = getTierForLevel(level);

  return (
    <div className="flex min-h-screen flex-col text-foreground md:flex-row">
      <Navbar />
      <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <FuturisticBorder>
            <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6 profile-card-container">
              <UserInfo 
                level={level}
                tier={userTier}
                job={userTitle.job}
                title={userTitle.title}
                username={username}
                avatarUrl={avatarUrl}
                onProfileUpdate={handleProfileUpdate}
              />

              <Separator className="my-4 bg-border/20" />

              <StatBars 
                hp={{current: baseStats.hp, max: 100}}
                mp={{current: baseStats.mp, max: 100}}
                ir={{current: baseStats.ir, max: 100}}
              />

              <Separator className="my-4 bg-border/20" />

              <Attributes 
                stats={stats}
                attributePoints={attributePoints}
                onSpendPoint={handleSpendPoint}
              />

               <Separator className="my-4 bg-border/20" />

              <FooterActions 
                gold={gold} 
                shopItems={shopItemsData}
                availablePoints={attributePoints}
              />
            </div>
          </FuturisticBorder>
        </div>
      </main>
    </div>
  );
}
