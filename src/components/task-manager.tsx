
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskItem } from './task-item';
import { FuturisticBorder } from './futuristic-border';
import { AlarmClock } from 'lucide-react';
import type { SkillCategory } from '@/lib/skills';
import { useToast } from '@/hooks/use-toast';
import { UserData } from '@/lib/userData';
import { completeTaskAction, deleteTaskAction, updateTaskDeadlineAction } from '@/app/(protected)/tasks/actions';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  difficulty: 'easy' | 'hard';
  reward: number;
  category: SkillCategory;
};

function TimerDisplay({ endTime, isPenalty }: { endTime: number, isPenalty: boolean }) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());
  const router = useRouter();

  useEffect(() => {
    if (endTime <= Date.now()) {
      setTimeLeft(0);
      router.refresh();
      return;
    }
    
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        router.refresh();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, router]);

  if (timeLeft <= 0) {
    return null;
  }

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const label = isPenalty ? "CEZA SÜRESİ" : "KALAN SÜRE";
  const labelColor = isPenalty ? "text-destructive" : "text-amber-400";

  return (
    <div className={`flex items-center justify-center gap-2 p-3 ${labelColor}`}>
      <AlarmClock className="h-5 w-5" />
      <p className="font-mono text-sm font-medium tracking-wider">
        {label}: {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
    </div>
  );
}

interface TaskManagerProps {
    username: string;
    initialUserData: UserData | null;
}

export function TaskManager({ username, initialUserData }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialUserData?.tasks || []);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setTasks(initialUserData?.tasks || []);
  }, [initialUserData]);

  const addTask = (taskText: string, difficulty: 'easy' | 'hard', category: SkillCategory) => {
    const reward = difficulty === 'easy' ? 50 : 200;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: taskText,
      completed: false,
      difficulty,
      reward,
      category,
    };
    
    const newTasks = [newTask, ...tasks];
    setTasks(newTasks);

    startTransition(async () => {
      const result = await updateTaskDeadlineAction(username, newTasks);
      if (result?.error) {
        toast({ title: "Hata", description: result.error, variant: 'destructive' });
        setTasks(tasks); // revert
      }
    });
  };

  const toggleTask = (task: Task) => {
    startTransition(async () => {
        const result = await completeTaskAction(username, task);
        if (result?.error) {
            toast({ title: "Hata", description: result.error, variant: "destructive" });
        }
        if(result?.message) {
             toast({
              title: "Görev Tamamlandı!",
              description: result.message
            });
        }
    });
  };
  
  const deleteTask = (id: string) => {
    startTransition(async () => {
        const result = await deleteTaskAction(username, id);
        if (result?.error) {
            toast({ title: "Hata", description: result.error, variant: "destructive" });
        }
    });
  };
  
  const isPenaltyActive = initialUserData?.penaltyEndTime && initialUserData.penaltyEndTime > Date.now();
  const isDeadlineActive = initialUserData?.taskDeadline && initialUserData.taskDeadline > Date.now() && (initialUserData?.tasks || []).some(t => !t.completed);

  return (
    <div className="max-w-4xl mx-auto w-full">
      <FuturisticBorder>
       <div className="bg-background/60 backdrop-blur-md p-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-2xl text-primary tracking-wider">ÖZEL GÖREVLER</CardTitle>
          <CreateTaskDialog onAddTask={addTask} />
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <div className="">
            {tasks.length > 0 ? (
              <div className="space-y-0">
                {tasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={() => toggleTask(task)} 
                    onDelete={() => deleteTask(task.id)} 
                    isPending={isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Henüz görev yok. Yeni bir tane oluştur!</p>
              </div>
            )}
          </div>
        </CardContent>
        
        {isPenaltyActive && initialUserData?.penaltyEndTime ? (
          <TimerDisplay endTime={initialUserData.penaltyEndTime} isPenalty={true} />
        ) : isDeadlineActive && initialUserData?.taskDeadline ? (
          <TimerDisplay endTime={initialUserData.taskDeadline} isPenalty={false} />
        ) : null}

        </div>
      </FuturisticBorder>
    </div>
  );
}
