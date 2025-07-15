import { Navbar } from '@/components/navbar';
import { FuturisticBorder } from '@/components/futuristic-border';
import { UserInfo } from './_components/user-info';
import { StatBars } from './_components/stat-bars';
import { Attributes } from './_components/attributes';
import { FooterActions } from './_components/footer-actions';
import { Separator } from '@/components/ui/separator';

import './profile.css';

export default function ProfilePage() {
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
                username="Sung Jin-Woo"
                avatarUrl="https://placehold.co/100x100.png"
              />

              <Separator className="my-4 bg-border/20" />

              <StatBars 
                hp={{current: 2000, max: 2220}}
                mp={{current: 250, max: 350}}
                ir={{current: 80, max: 100}}
              />

              <Separator className="my-4 bg-border/20" />

              <Attributes 
                stats={{
                  str: 48,
                  vit: 27,
                  agi: 27,
                  int: 27,
                  per: 27,
                }}
              />

               <Separator className="my-4 bg-border/20" />

              <FooterActions gold={150320} />
            </div>
          </FuturisticBorder>
        </div>
      </main>
    </div>
  );
}
