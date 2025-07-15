
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

import './profile.css';

const defaultUsername = "Sung Jin-Woo";
const defaultAvatarUrl = "https://placehold.co/100x100.png";
const defaultStats = { str: 0, vit: 0, agi: 0, int: 0, per: 0 };


export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States for all user data
  const [gold, setGold] = useState(150);
  const [username, setUsername] = useState(defaultUsername);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl);
  const [level, setLevel] = useState(0);
  const [attributePoints, setAttributePoints] = useState(0);
  const [stats, setStats] = useState(defaultStats);


  const safelyParseJSON = (key: string, defaultValue: any) => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        return defaultValue;
    }
  };

  // Effect to load data from localStorage on mount
  useEffect(() => {
    setGold(safelyParseJSON('userGold', 150));
    setUsername(safelyParseJSON('username', defaultUsername));
    setAvatarUrl(safelyParseJSON('avatarUrl', defaultAvatarUrl));
    setLevel(safelyParseJSON('level', 0));
    setAttributePoints(safelyParseJSON('attributePoints', 0));
    setStats(safelyParseJSON('stats', defaultStats));
    setIsMounted(true);
  }, []);

  // Effect to listen for storage changes from other tabs/windows
  useEffect(() => {
    if (!isMounted) return;

    const handleStorageChange = (event: StorageEvent) => {
        // Update all states if any of them change in localStorage
        if (event.key === 'userGold') setGold(safelyParseJSON('userGold', 150));
        if (event.key === 'username') setUsername(safelyParseJSON('username', defaultUsername));
        if (event.key === 'avatarUrl') setAvatarUrl(safelyParseJSON('avatarUrl', defaultAvatarUrl));
        if (event.key === 'level') setLevel(safelyParseJSON('level', 0));
        if (event.key === 'attributePoints') setAttributePoints(safelyParseJSON('attributePoints', 0));
        if (event.key === 'stats') setStats(safelyParseJSON('stats', defaultStats));
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
        <div className="flex min-h-screen flex-col bg-transparent text-foreground md:flex-row">
            <Navbar />
            <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
                {/* You can add a skeleton loader here if you want */}
            </main>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-foreground md:flex-row">
      <Navbar />
      <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <FuturisticBorder>
            <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6 profile-card-container">
              <h1 className="text-2xl font-headline tracking-widest text-primary text-center uppercase mb-4">
                Status
              </h1>
              
              <UserInfo 
                level={level}
                job="None"
                title="Wolf Assassin"
                username={username}
                avatarUrl={avatarUrl}
                onProfileUpdate={handleProfileUpdate}
              />

              <Separator className="my-4 bg-border/20" />

              <StatBars 
                hp={{current: 2220, max: 2220}}
                mp={{current: 350, max: 350}}
                ir={{current: 100, max: 100}}
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
