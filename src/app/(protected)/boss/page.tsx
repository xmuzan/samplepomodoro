
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FuturisticBorder } from '@/components/futuristic-border';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { UserStats } from '@/lib/stats'; 
import { Swords, Skull, Timer, Coins } from 'lucide-react';
import './boss.css';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';
import { getUserData, updateUserData, getGlobalBossData, updateGlobalBossData } from '@/lib/userData';

const BOSS_RESPAWN_HOURS = 48;

interface Boss {
  id: string;
  name: string;
  imageUrl: string;
  maxHp: number;
}

const currentBoss: Boss = {
  id: 'netanyahu',
  name: 'Süper Domuz Netanyahu',
  imageUrl: '/domuzboss.png',
  maxHp: 100,
};

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


export default function BossPage() {
    const [bossHp, setBossHp] = useState(currentBoss.maxHp);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [bossRespawnTime, setBossRespawnTime] = useState<number | null>(null);
    const [isBossDefeated, setIsBossDefeated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const { toast } = useToast();
    const router = useRouter();
    
    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    const loadData = useCallback(async (currentUser: User) => {
        setIsLoading(true);
        try {
            const bossData = await getGlobalBossData(currentBoss.id);
            const userData = await getUserData(currentUser.username);

            if (bossData.respawnTime && bossData.respawnTime > Date.now()) {
                setBossRespawnTime(bossData.respawnTime);
            } else {
                if (bossData.hp !== undefined) {
                     if (bossData.hp <= 0) {
                        setIsBossDefeated(true);
                    } else {
                        setBossHp(bossData.hp);
                    }
                } else {
                     setBossHp(currentBoss.maxHp);
                }
                setBossRespawnTime(null);
            }

            if (userData?.baseStats) {
                setUserStats(userData.baseStats);
            } else {
                setUserStats({ hp: 100, mp: 100, ir: 100 });
            }

        } catch (error) {
            console.error("Error loading boss data:", error);
            setBossHp(currentBoss.maxHp);
            toast({ title: "Hata", description: "Boss verileri yüklenirken bir sorun oluştu.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (user) {
            loadData(user);
        } else if (user === null) {
            // This case handles when getCurrentUser explicitly returns null (not just initially undefined)
            // It might mean the cookie is invalid or expired.
            setIsLoading(false);
        }
    }, [user, loadData]);


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
        await updateUserData(user.username, { baseStats: newStats });
        setUserStats(newStats);

        const damage = currentBoss.maxHp * 0.05;
        const newBossHp = Math.max(0, bossHp - damage);

        await updateGlobalBossData(currentBoss.id, { hp: newBossHp });
        setBossHp(newBossHp);

        toast({
            title: 'Saldırı Başarılı!',
            description: 'Boss\'a hasar verdin ama sen de yara aldın.',
        });

        if (newBossHp <= 0) {
            handleBossDefeat();
        }
    };

    const handleBossDefeat = async () => {
        if (!user) return;
        toast({
            title: 'BOSS YENİLDİ!',
            description: (
                <div className="flex items-center justify-center w-full gap-2 text-yellow-400">
                    <Coins className="h-5 w-5" />
                    <span className="font-bold">+1000 Altın</span>
                </div>
            )
        });

        const userData = await getUserData(user.username);
        const currentGold = userData?.userGold || 0;
        await updateUserData(user.username, { userGold: currentGold + 1000 });
        
        const respawnTime = Date.now() + BOSS_RESPAWN_HOURS * 60 * 60 * 1000;
        await updateGlobalBossData(currentBoss.id, { respawnTime, hp: currentBoss.maxHp });
        setBossRespawnTime(respawnTime);
        setIsBossDefeated(true);

        router.refresh();
    }

    const resetBossScreen = () => {
        setIsBossDefeated(false);
        if(user) {
            loadData(user);
        }
    }
    
    if (isLoading) {
        return (
            <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
                <p>Yükleniyor...</p>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
                <p>Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.</p>
            </main>
        );
    }
    
    const hpPercentage = (bossHp / currentBoss.maxHp) * 100;

    return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto">
                <FuturisticBorder>
                    <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6">
                        {bossRespawnTime ? (
                            <RespawnTimer respawnTime={bossRespawnTime} />
                        ) : isBossDefeated ? (
                            <BossDefeatedScreen onReset={resetBossScreen} />
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
