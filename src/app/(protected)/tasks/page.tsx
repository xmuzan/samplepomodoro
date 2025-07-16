
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TaskManager } from '@/components/task-manager';
import { getCurrentUser } from '@/lib/auth';
import { getUserData } from '@/lib/userData';
import type { Task } from '@/components/task-manager';

// This is now a Client Component
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [penaltyEndTime, setPenaltyEndTime] = useState<number | null>(null);
  const [taskDeadline, setTaskDeadline] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadTaskData = useCallback(async () => {
    setIsLoading(true);
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        
        setUsername(currentUser.username);
        const userData = await getUserData(currentUser.username);

        setTasks(userData?.tasks || []);
        setPenaltyEndTime(userData?.penaltyEndTime || null);
        setTaskDeadline(userData?.taskDeadline || null);
    } catch (error) {
        console.error("Failed to load task data:", error);
    } finally {
        setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadTaskData();
  }, [loadTaskData]);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  // Yükleme bittikten sonra kullanıcı adı hala yoksa (yönlendirme beklenirken), hiçbir şey render etme
  if (!username) {
    return null;
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
      <TaskManager 
        username={username} 
        initialTasks={tasks}
        initialPenaltyEndTime={penaltyEndTime}
        initialTaskDeadline={taskDeadline}
      />
    </main>
  );
}
