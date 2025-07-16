
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

import './profile.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


const defaultUserData: UserData = {
    userGold: 150,
    avatarUrl: "https://placehold.co/100x100.png",
    level: 0,
    tasksCompletedThisLevel: 0,
    tasksRequiredForNextLevel: 32,
    attributePoints: 0,
    stats: { str: 0, vit: 0, agi: 0, int: 0, per: 0 },
    baseStats: { hp: 100, mp: 100, ir: 100 },
    skillData: {},
    tasks: [],
    inventory: [],
};

// This is now a Server Component
export default async function ProfilePage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('currentUser');

  if (!sessionCookie) {
    redirect('/login');
  }

  const currentUser = JSON.parse(sessionCookie.value).user;
  const userData = await getUserData(currentUser.username);

  if (!userData) {
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
