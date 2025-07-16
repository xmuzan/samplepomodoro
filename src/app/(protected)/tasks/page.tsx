
'use client';

import { TaskManager } from '@/components/task-manager';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TasksPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const currentUser = getCurrentUser();

  useEffect(() => {
    setIsClient(true);
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  if (!isClient || !currentUser) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <p>Yükleniyor...</p>
      </main>
    );
  }
  
  return (
    <main className="flex flex-1 items-center justify-center p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
      <TaskManager username={currentUser.username} />
    </main>
  );
}
