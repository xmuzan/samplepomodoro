
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FuturisticBorder } from '@/components/futuristic-border';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { UserStats } from '@/lib/stats'; 
import { Swords, Skull, Timer, Coins } from 'lucide-react';
import '../boss.css';
import type { User } from '@/types';
import { updateUserData, updateGlobalBossData } from '@/lib/userData';

export interface Boss {
  id: string;
  name: string;
  imageUrl: string;
  maxHp: number;
}

function BossDefeatedScreen({ onReset }: { onReset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full min-h-[50vh]">
            <Skull className="h-24 w-24 text-primary text-glow mb-4" />
            <h2 className="text-3xl font-headline text-glow">BOSS YENİLDİ!</h2>
            <p className="text-muted-foreground mt-2 mb-6">
                Bir sonraki boss ortaya çıkana kadar dinlen.
            </p>
            <Button onClick={onReset}>Harika!</Button>
        </div>
    );
}

function RespawnTimer({ respawnTime }: { respawnTime: number }) {
  const [timeLeft, setTimeLeft] = useState(respawnTime - Date.now());
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = respawnTime - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        router.refresh();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [respawnTime, router]);

  if (timeLeft <= 0) return null;

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center min-h-[50vh]">
        <Timer className="h-24 w-24 text-primary text-glow mb-4 animate-pulse" />
        <h2 className="text-3xl font-headline text-glow">YENİ BOSS DOĞUYOR</h2>
        <p className="text-muted-foreground mt-2 mb-6">
            Yeni bir tehdit ortaya çıkana kadar hazırlan.
        </p>
        <p className="font-mono text-3xl font-medium tracking-wider text-primary">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
    </div>
  );
}

interface BossManagerProps {
    user: User;
    initialUserStats: UserStats;
    initialUserGold: number;
    initialBossHp: number;
    initialRespawnTime: number | null;
    currentBoss: Boss;
}

export function BossManager({
    user,
    initialUserStats,
    initialUserGold,
    initialBossHp,
    initialRespawnTime,
    currentBoss
}: BossManagerProps) {
    const [bossHp, setBossHp] = useState(initialBossHp);
    const [userStats, setUserStats] = useState<UserStats>(initialUserStats);
    const [isBossDefeated, setIsBossDefeated] = useState(initialBossHp <= 0 && !initialRespawnTime);

    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        setBossHp(initialBossHp);
        setUserStats(initialUserStats);
        setIsBossDefeated(initialBossHp <= 0 && !initialRespawnTime);
    }, [initialBossHp, initialUserStats, initialRespawnTime]);
    

    const handleAttack = async () => {
        if (bossHp <= 0 || !user || !userStats) return;

        if (userStats.mp < 10) {
            toast({
                variant: 'destructive',
                title: 'Yetersiz MP',
                description: 'Saldırmak için yeterli Mana Puanın yok.',
            });
            return;
        }

        const newStats = { 
            hp: Math.max(0, userStats.hp - 2),
            mp: Math.max(0, userStats.mp - 10),
            ir: userStats.ir
        };
        setUserStats(newStats); // Optimistic update

        const damage = currentBoss.maxHp * 0.05;
        const newBossHp = Math.max(0, bossHp - damage);
        setBossHp(newBossHp); // Optimistic update

        toast({
            title: 'Saldırı Başarılı!',
            description: 'Boss\'a hasar verdin ama sen de yara aldın.',
        });

        // Database updates
        await updateUserData(user.username, { baseStats: newStats });
        await updateGlobalBossData(currentBoss.id, { hp: newBossHp });

        if (newBossHp <= 0) {
            handleBossDefeat();
        } else {
             router.refresh();
        }
    };

    const handleBossDefeat = async () => {
        if (!user) return;
        
        setIsBossDefeated(true);

        toast({
            title: 'BOSS YENİLDİ!',
            description: (
                <div className="flex items-center justify-center w-full gap-2 text-yellow-400">
                    <Coins className="h-5 w-5" />
                    <span className="font-bold">+1000 Altın</span>
                </div>
            )
        });

        const newGold = initialUserGold + 1000;
        await updateUserData(user.username, { userGold: newGold });
        
        // This is a fixed value, importing it is okay
        const BOSS_RESPAWN_HOURS_CONST = 48;
        const respawnTime = Date.now() + BOSS_RESPAWN_HOURS_CONST * 60 * 60 * 1000;
        await updateGlobalBossData(currentBoss.id, { respawnTime, hp: currentBoss.maxHp });
        
        router.refresh();
    }
    
    const hpPercentage = currentBoss.maxHp > 0 ? (bossHp / currentBoss.maxHp) * 100 : 0;

    return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto">
                <FuturisticBorder>
                    <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6 min-h-[50vh]">
                        {initialRespawnTime ? (
                            <RespawnTimer respawnTime={initialRespawnTime} />
                        ) : isBossDefeated ? (
                            <BossDefeatedScreen onReset={() => router.refresh()} />
                        ) : (
                            <div className="flex flex-col items-center">
                                <h1 className="text-4xl font-headline tracking-widest text-destructive uppercase boss-name-glow text-center mb-4">
                                    {currentBoss.name}
                                </h1>
                                
                                <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden border-2 border-destructive/50 shadow-[0_0_30px_hsl(var(--destructive)/0.5)] mb-6">
                                     <Image 
                                        src={currentBoss.imageUrl}
                                        alt={currentBoss.name}
                                        fill
                                        className="object-cover"
                                        data-ai-hint="giant pig monster"
                                     />
                                </div>

                                <div className="w-full max-w-2xl mb-6">
                                    <div className="boss-hp-bar-container">
                                        <div className="boss-hp-bar">
                                            <div className="boss-hp-bar-fill" style={{ width: `${hpPercentage}%` }} />
                                        </div>
                                    </div>
                                    <p className="text-center font-mono text-lg mt-2 text-red-300">
                                        {Math.ceil(bossHp)} / {currentBoss.maxHp} HP
                                    </p>
                                </div>
                                
                                <Button 
                                    size="lg" 
                                    onClick={handleAttack}
                                    disabled={bossHp <= 0}
                                    className="gap-2 text-lg font-bold px-10 py-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 attack-button"
                                >
                                    <Swords className="h-6 w-6" />
                                    SALDIR
                                </Button>
                            </div>
                        )}
                    </div>
                </FuturisticBorder>
            </div>
        </main>
    );
}
