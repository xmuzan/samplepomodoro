
'use server';

import { redirect } from 'next/navigation';
import { FuturisticBorder } from '@/components/futuristic-border';
import { UserInfo } from './_components/user-info';
import { StatBars } from './_components/stat-bars';
import { Attributes } from './_components/attributes';
import { FooterActions } from './_components/footer-actions';
import { Separator } from '@/components/ui/separator';
import { getTitleForLevel } from '@/lib/titles';
import { getTierForLevel } from '@/lib/ranks';
import { cookies } from 'next/headers';
import { getUserData } from '@/lib/userData';
import type { User } from '@/types';

import './profile.css';

function getCurrentUser(): User | null {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('currentUser');
    if (!sessionCookie?.value) return null;

    try {
        const session = JSON.parse(sessionCookie.value);
        if (session.expiry && session.expiry > Date.now()) {
            return session.user;
        }
    } catch (e) {
        return null;
    }
    return null;
}

export default async function ProfilePage() {
  const user = getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const userData = await getUserData(user.username);
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
              username={user.username}
              avatarUrl={userData.avatarUrl}
            />

            <Separator className="my-4 bg-border/20" />

            <StatBars
              hp={{ current: userData.baseStats.hp, max: 100 }}
              mp={{ current: userData.baseStats.mp, max: 100 }}
              ir={{ current: userData.baseStats.ir, max: 100 }}
            />

            <Separator className="my-4 bg-border/20" />

            <Attributes
              stats={userData.stats}
              attributePoints={userData.attributePoints}
            />

            <Separator className="my-4 bg-border/20" />

            <FooterActions
              gold={userData.userGold}
              availablePoints={userData.attributePoints}
            />
          </div>
        </FuturisticBorder>
      </div>
    </main>
  );
}
