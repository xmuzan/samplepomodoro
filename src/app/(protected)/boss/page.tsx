
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getGlobalBossData, getUserData, getBossDefinition, initializeBossDefinition } from '@/lib/userData';
import { BossManager } from './_components/boss-manager';

export interface Boss {
  id: string;
  name: string;
  imageUrl: string;
  maxHp: number;
}

const BOSS_ID = 'netanyahu';

const defaultBoss: Boss = {
  id: BOSS_ID,
  name: 'Süper Domuz Netanyahu',
  imageUrl: '/domuzboss.png',
  maxHp: 100,
};

// This is now a Server Component
export default async function BossPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('currentUser');

  if (!sessionCookie) {
    redirect('/login');
  }

  const currentUser = JSON.parse(sessionCookie.value).user;
  const userData = await getUserData(currentUser.username);

  // Fetch boss definition from DB, or initialize it if it doesn't exist
  let currentBoss = await getBossDefinition(BOSS_ID);
  if (!currentBoss) {
    await initializeBossDefinition(BOSS_ID, defaultBoss);
    currentBoss = defaultBoss;
  }
  
  const bossData = await getGlobalBossData(currentBoss.id);

  if (!userData?.baseStats) {
     return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <p>Kullanıcı istatistikleri yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
        </main>
    );
  }

  const initialBossHp = bossData.hp !== undefined ? bossData.hp : currentBoss.maxHp;
  const initialRespawnTime = bossData.respawnTime && bossData.respawnTime > Date.now() ? bossData.respawnTime : null;
  
  return (
    <BossManager 
        user={currentUser}
        initialUserStats={userData.baseStats}
        initialUserGold={userData.userGold || 0}
        initialBossHp={initialBossHp}
        initialRespawnTime={initialRespawnTime}
        currentBoss={currentBoss}
    />
  );
}
