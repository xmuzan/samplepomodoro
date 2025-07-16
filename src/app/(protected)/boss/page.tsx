
'use server';

import { redirect } from 'next/navigation';
import { getGlobalBossData, getUserData, getBossDefinition, initializeBossDefinition } from '@/lib/userData';
import { BossManager } from './_components/boss-manager';
import type { User } from '@/types';
import { cookies } from 'next/headers';
import type { Boss } from './_components/boss-manager';

const BOSS_ID = 'netanyahu';

const defaultBoss: Boss = {
  id: BOSS_ID,
  name: 'Süper Domuz Netanyahu',
  imageUrl: '/domuzboss.png',
  maxHp: 100,
};

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

export default async function BossPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        redirect('/login');
    }

    const userData = await getUserData(currentUser.username);
    if (!userData || !userData.baseStats) {
        // Redirect or show an error, but for now we'll handle it in the component
        return (
            <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
                <p>Kullanıcı verisi veya istatistikleri bulunamadı.</p>
            </main>
        );
    }
    
    let currentBoss = await getBossDefinition(BOSS_ID);
    if (!currentBoss) {
      await initializeBossDefinition(BOSS_ID, defaultBoss);
      currentBoss = defaultBoss;
    }

    const bossData = await getGlobalBossData(currentBoss.id);

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
