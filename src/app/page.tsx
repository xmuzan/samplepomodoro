import { Navbar } from '@/components/navbar';
import { TaskManager } from '@/components/task-manager';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col text-foreground md:flex-row">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
        <TaskManager />
      </main>
    </div>
  );
}
