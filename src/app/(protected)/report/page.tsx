
'use server';

import { redirect } from 'next/navigation';
import { ReportManager } from './_components/report-manager';
import { getUserData } from '@/lib/userData';
import { cookies } from 'next/headers';
import type { User } from '@/types';

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

export default async function ReportPage() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const userData = await getUserData(currentUser.username);
  if (!userData?.baseStats) {
    return (
      <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
        <p>Kullanıcı istatistikleri yüklenemedi.</p>
      </main>
    );
  }

  return <ReportManager user={currentUser} initialStats={userData.baseStats} />;
}
