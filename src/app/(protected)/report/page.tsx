
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FuturisticBorder } from '@/components/futuristic-border';
import { ReportCard, type ReportAction } from './_components/report-card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { HeartPulse, FlaskConical } from 'lucide-react';
import { getUserData, updateUserData } from '@/lib/userData';
import { getCurrentUser } from '@/lib/auth';
import type { UserStats } from '@/lib/stats';


import './report.css';

const hpActions: ReportAction[] = [
  {
    id: 'hp_sleep',
    title: 'Yetersiz Uyku',
    description: 'Gece yeterince dinlenemedin. Vücudun ve zihnin yorgun.',
    impact: -6,
    stat: 'hp',
  },
  {
    id: 'hp_food',
    title: 'Kötü Beslenme',
    description: 'İşlenmiş gıda veya abur cubur tükettin. Enerjin düştü.',
    impact: -3,
    stat: 'hp',
  },
  {
    id: 'hp_sport',
    title: 'Spor Hedefini Aksatma',
    description: 'Bugünkü antrenmanını veya fiziksel aktivite hedefini atladın.',
    impact: -5,
    stat: 'hp',
  },
];

const mpActions: ReportAction[] = [
  {
    id: 'mp_work',
    title: 'Odaklı Çalışma',
    description: 'En az 30 dakika boyunca dikkat dağılmadan çalıştın, okudun veya öğrendin. Zihinsel bir bedeli var.',
    impact: -10,
    stat: 'mp',
  },
  {
    id: 'mp_social',
    title: 'Amaçsız Dolaşma',
    description: 'Sosyal medyada veya internette en az 5 dakika amaçsızca gezindin. Zihnin ucuz dopamine boğuldu.',
    impact: -40,
    stat: 'mp',
  },
];


export default function ReportPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        const currentUser = getCurrentUser();
        if (!currentUser) {
            toast({ title: "Hata", description: "Kullanıcı oturumu bulunamadı.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        try {
            const data = await getUserData(currentUser.username);
            if(data?.baseStats) {
                setStats(data.baseStats);
            } else {
                 toast({ title: "Hata", description: "Kullanıcı verileri bulunamadı.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Failed to load user stats:", error);
            toast({ title: "Hata", description: "Kullanıcı istatistikleri yüklenirken bir sorun oluştu.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    loadData();
  }, [toast]);

  const handleReport = async (action: ReportAction) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const currentData = await getUserData(currentUser.username);
    if (!currentData || !currentData.baseStats) return;

    const currentStats = currentData.baseStats;
    const newStats = { ...currentStats };

    if (action.stat === 'hp') {
        newStats.hp = Math.max(0, Math.min(100, currentStats.hp + action.impact));
    } else if (action.stat === 'mp') {
        newStats.mp = Math.max(0, Math.min(100, currentStats.mp + action.impact));
    }

    await updateUserData(currentUser.username, { baseStats: newStats });
    setStats(newStats);
    
    // Refresh the router to update data in other components like the profile page
    router.refresh();
    
    toast({
      title: "Rapor Başarılı",
      description: `${action.title}: ${action.stat.toUpperCase()} ${action.impact > 0 ? '+' : ''}${action.impact}% değişti.`,
      variant: action.impact > 0 ? 'default' : 'destructive'
    });
  };

  if (isLoading) {
    return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <p>Yükleniyor...</p>
        </main>
    );
  }
  
  if (!stats) {
    return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <p>Kullanıcı istatistikleri yüklenemedi. Lütfen tekrar deneyin.</p>
        </main>
    );
  }

  return (
    <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
      <div className="max-w-4xl mx-auto">
        <FuturisticBorder>
          <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6">
            <h1 className="text-2xl font-headline tracking-widest text-primary uppercase text-glow text-center mb-6">
              GÜNLÜK RAPOR
            </h1>
            
            <div className="mb-8">
              <h2 className="flex items-center gap-3 text-xl font-bold text-red-400 mb-4">
                <HeartPulse className="h-6 w-6" />
                HP (Yaşam Puanı) Raporları
              </h2>
              <div className="report-grid">
                {hpActions.map((action) => (
                  <ReportCard key={action.id} action={action} onReport={handleReport} />
                ))}
              </div>
            </div>

            <Separator className="my-6 bg-border/20" />

            <div>
              <h2 className="flex items-center gap-3 text-xl font-bold text-blue-400 mb-4">
                <FlaskConical className="h-6 w-6" />
                MP (Mana Puanı) Raporları
              </h2>
              <div className="report-grid">
                {mpActions.map((action) => (
                  <ReportCard key={action.id} action={action} onReport={handleReport} />
                ))}
              </div>
            </div>

          </div>
        </FuturisticBorder>
      </div>
    </main>
  );
}
