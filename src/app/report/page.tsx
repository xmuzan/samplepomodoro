
'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { FuturisticBorder } from '@/components/futuristic-border';
import { ReportCard, type ReportAction } from './_components/report-card';
import { Separator } from '@/components/ui/separator';
import { updateStats, getStats, type UserStats } from '@/lib/stats';
import { useToast } from '@/hooks/use-toast';
import { HeartPulse, FlaskConical } from 'lucide-react';

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
  const [stats, setStats] = useState<UserStats>({ hp: 100, mp: 100, ir: 100 });
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    setStats(getStats());
  }, []);

  const handleReport = (action: ReportAction) => {
    const newStats = updateStats({ [action.stat]: action.impact });
    setStats(newStats);
    
    toast({
      title: "Rapor Başarılı",
      description: `${action.title}: ${action.stat.toUpperCase()} ${action.impact > 0 ? '+' : ''}${action.impact}% değişti.`,
      variant: action.impact > 0 ? 'default' : 'destructive'
    });
  };

  if (!isMounted) {
    return (
        <div className="flex min-h-screen flex-col bg-transparent text-foreground md:flex-row">
            <Navbar />
            <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
                {/* Skeleton loader can be added here */}
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
            <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6">
              <h1 className="text-2xl font-headline tracking-widest text-primary uppercase text-glow text-center mb-6">
                GÜNLÜK RAPOR
              </h1>
              
              {/* HP Section */}
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

              {/* MP Section */}
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
    </div>
  );
}
