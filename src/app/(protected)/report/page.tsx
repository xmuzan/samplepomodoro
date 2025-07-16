
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReportManager } from './_components/report-manager';
import { getUserData } from '@/lib/userData';

export default async function ReportPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('currentUser');

  if (!sessionCookie) {
    redirect('/login');
  }

  const currentUser = JSON.parse(sessionCookie.value).user;
  const userData = await getUserData(currentUser.username);

  if (!userData?.baseStats) {
     return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <p>Kullanıcı istatistikleri yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
        </main>
    );
  }

  return <ReportManager user={currentUser} initialStats={userData.baseStats} />;
}
