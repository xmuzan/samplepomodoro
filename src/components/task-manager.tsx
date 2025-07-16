
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskItem } from './task-item';
import { FuturisticBorder } from './futuristic-border';
import { AlarmClock, Coins } from 'lucide-react';
import type { SkillCategory } from '@/lib/skills';
import { useToast } from '@/hooks/use-toast';
import { getUserData, updateUserData, updateTasks, UserData } from '@/lib/userData';

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
    initialTasks: Task[];
    initialPenaltyEndTime: number | null;
    initialTaskDeadline: number | null;
}

export function TaskManager({ username, initialTasks, initialPenaltyEndTime, initialTaskDeadline }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [penaltyEndTime, setPenaltyEndTime] = useState<number | null>(initialPenaltyEndTime);
  const [taskDeadline, setTaskDeadline] = useState<number | null>(initialTaskDeadline);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setTasks(initialTasks);
    setPenaltyEndTime(initialPenaltyEndTime);
    setTaskDeadline(initialTaskDeadline);
  }, [initialTasks, initialPenaltyEndTime, initialTaskDeadline]);

  // The deadline penalty check should now happen on the server before page load,
  // but we keep a client-side check as a fallback.
  useEffect(() => {
    const checkDeadline = async () => {
        if (initialTaskDeadline && initialTaskDeadline < Date.now()) {
             const hasIncompleteTasks = tasks.some((t: Task) => !t.completed);
             const isPenaltyActive = penaltyEndTime && penaltyEndTime > Date.now();
            if (hasIncompleteTasks && !isPenaltyActive) {
                const newPenaltyTime = Date.now() + 24 * 60 * 60 * 1000;
                await updateUserData(username, { penaltyEndTime: newPenaltyTime, taskDeadline: null });
                setPenaltyEndTime(newPenaltyTime);
                setTaskDeadline(null);
                toast({
                    title: "Ceza Görevi Başladı!",
                    description: "Görevleri zamanında tamamlayamadın. 24 saatliğine özelliklerin kilitlendi.",
                    variant: "destructive"
                });
                router.refresh();
            }
        }
    }
    checkDeadline();
  }, [initialTaskDeadline, penaltyEndTime, tasks, toast, username, router]);
  
  const updateTasksInDb = useCallback(async (newTasks: Task[]) => {
      setTasks(newTasks);
      const hasTasks = newTasks.length > 0;
      let dataToUpdate: Partial<UserData> = { tasks: newTasks };

      const userData = await getUserData(username);

      if (!hasTasks) {
          dataToUpdate.taskDeadline = null;
          dataToUpdate.penaltyEndTime = null;
          setTaskDeadline(null);
          setPenaltyEndTime(null);
      } else {
          const currentPenalty = userData?.penaltyEndTime && userData.penaltyEndTime > Date.now();
          const hasIncompleteTasks = newTasks.some(task => !task.completed);

          if (hasIncompleteTasks && !userData?.taskDeadline && !currentPenalty) {
              const newDeadline = Date.now() + 24 * 60 * 60 * 1000;
              dataToUpdate.taskDeadline = newDeadline;
              setTaskDeadline(newDeadline);
          } else if (!hasIncompleteTasks) {
              dataToUpdate.taskDeadline = null;
              setTaskDeadline(null);
          }
      }
      
      await updateTasks(username, dataToUpdate);
      router.refresh(); // Re-fetch server-side props for consistency
  }, [username, router]);

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
    updateTasksInDb(newTasks);
  };

  const toggleTask = async (id: string) => {
    let toggledTask: Task | undefined;
    const newTasks = tasks.map(task => {
        if (task.id === id) {
            toggledTask = { ...task, completed: !task.completed };
            return toggledTask;
        }
        return task;
    });

    if (!toggledTask) return;

    if (toggledTask.completed) {
        try {
            const userData = await getUserData(username);
            if (!userData) return;

            const isPenaltyActiveNow = userData.penaltyEndTime && userData.penaltyEndTime > Date.now();
            if(isPenaltyActiveNow) {
                toast({
                  title: "Ceza Aktif!",
                  description: "Ceza süresi bitene kadar ödül kazanamazsın.",
                  variant: "destructive"
                });
                updateTasksInDb(newTasks);
                return;
            }

            let finalReward = toggledTask.reward;
            let canLevelUp = true;
            
            if (userData.baseStats.hp === 0) {
                finalReward = Math.round(toggledTask.reward * 0.1);
                toast({ title: "HP Sıfır!", description: "Altın kazanımı %90 azaldı.", variant: "destructive" });
            }
            if (userData.baseStats.mp === 0) {
                canLevelUp = false;
                toast({ title: "MP Sıfır!", description: "Seviye ilerlemesi durduruldu.", variant: "destructive" });
            }

            const updates: Partial<UserData> = {
                userGold: (userData.userGold || 0) + finalReward,
                tasks: newTasks,
            };

            if (canLevelUp) {
                let { level, tasksCompletedThisLevel, tasksRequiredForNextLevel, attributePoints, skillData } = userData;
                tasksCompletedThisLevel = (tasksCompletedThisLevel || 0) + 1;

                if (tasksCompletedThisLevel >= tasksRequiredForNextLevel) {
                    level += 1;
                    tasksCompletedThisLevel = 0;
                    tasksRequiredForNextLevel = 32 + level;
                    attributePoints = (attributePoints || 0) + 1;
                }
                
                const category = toggledTask.category;
                if (category !== 'other') {
                    const TASKS_PER_RANK = 20;
                    skillData = skillData || {};
                    if (!skillData[category]) skillData[category] = { completedTasks: 0, rankIndex: 0 };
                    skillData[category]!.completedTasks += 1;
                    if (skillData[category]!.completedTasks >= TASKS_PER_RANK && skillData[category]!.rankIndex < 9) {
                        skillData[category]!.rankIndex += 1;
                        skillData[category]!.completedTasks = 0;
                    }
                }

                updates.level = level;
                updates.tasksCompletedThisLevel = tasksCompletedThisLevel;
                updates.tasksRequiredForNextLevel = tasksRequiredForNextLevel;
                updates.attributePoints = attributePoints;
                updates.skillData = skillData;
            }
            
            await updateUserData(username, updates);
            setTasks(newTasks);
            router.refresh();

            toast({
              title: "Görev Tamamlandı!",
              description: <div className="flex items-center justify-center w-full gap-2 text-yellow-400"><Coins className="h-5 w-5" /><span className="font-bold">+{finalReward} Altın</span></div>
            });

        } catch (error) {
            console.error("Error completing task:", error);
        }
    } else {
      updateTasksInDb(newTasks);
    }
  };
  
  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(task => task.id !== id);
    updateTasksInDb(newTasks);
  };

  const isPenaltyActive = penaltyEndTime && penaltyEndTime > Date.now();
  const isDeadlineActive = taskDeadline && taskDeadline > Date.now() && tasks.some(t => !t.completed);

  return (
    <div className="max-w-4xl mx-auto">
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
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Henüz görev yok. Yeni bir tane oluştur!</p>
              </div>
            )}
          </div>
        </CardContent>
        
        {isPenaltyActive ? (
          <TimerDisplay endTime={penaltyEndTime} isPenalty={true} />
        ) : isDeadlineActive ? (
          <TimerDisplay endTime={taskDeadline} isPenalty={false} />
        ) : null}

        </div>
      </FuturisticBorder>
    </div>
  );
}
