
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

export default function ProfilePage() {
  const [gold, setGold] = useState(150);
  const [username, setUsername] = useState(defaultUsername);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedGold = localStorage.getItem('userGold');
      if (storedGold) {
        setGold(JSON.parse(storedGold));
      }
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
      const storedAvatarUrl = localStorage.getItem('avatarUrl');
      if (storedAvatarUrl) {
        setAvatarUrl(storedAvatarUrl);
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
        const handleStorageChange = () => {
            const storedGold = localStorage.getItem('userGold');
            if (storedGold) {
                setGold(JSON.parse(storedGold));
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }
  }, [isMounted]);

  const handleProfileUpdate = (newUsername: string, newAvatarUrl: string) => {
    setUsername(newUsername);
    setAvatarUrl(newAvatarUrl);
    localStorage.setItem('username', newUsername);
    localStorage.setItem('avatarUrl', newAvatarUrl);
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
                level={18}
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
                stats={{
                  str: 0,
                  vit: 0,
                  agi: 0,
                  int: 0,
                  per: 0,
                }}
              />

               <Separator className="my-4 bg-border/20" />

              <FooterActions gold={gold} shopItems={shopItemsData} />
            </div>
          </FuturisticBorder>
        </div>
      </main>
    </div>
  );
}
