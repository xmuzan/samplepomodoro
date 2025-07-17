
'use server';

import { redirect } from 'next/navigation';
import { TaskManager } from '@/components/task-manager';
import { cookies } from 'next/headers';
import { getUserData } from '@/lib/userData';
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

export default async function TasksPage() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const userData = await getUserData(currentUser.username);
  
  return (
    <main className="flex flex-1 items-center justify-center p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
      <TaskManager
        username={currentUser.username}
        initialUserData={userData}
      />
    </main>
  );
}
