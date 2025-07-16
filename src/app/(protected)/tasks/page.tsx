
import { TaskManager } from '@/components/task-manager';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUserData } from '@/lib/userData';
import type { Task } from '@/components/task-manager';

// This is a Server Component
export default async function TasksPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('currentUser');

  // This check is redundant due to the layout, but good for safety.
  if (!sessionCookie) {
    redirect('/');
  }

  const currentUser = JSON.parse(sessionCookie.value).user;
  const userData = await getUserData(currentUser.username);

  const initialTasks: Task[] = userData?.tasks || [];
  const penaltyEndTime = userData?.penaltyEndTime || null;
  const taskDeadline = userData?.taskDeadline || null;
  
  return (
    <main className="flex flex-1 items-center justify-center p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
      <TaskManager 
        username={currentUser.username} 
        initialTasks={initialTasks}
        initialPenaltyEndTime={penaltyEndTime}
        initialTaskDeadline={taskDeadline}
      />
    </main>
  );
}
