
'use client';

import { useState, useEffect, useCallback } from 'react';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskItem } from './task-item';
import { Skeleton } from './ui/skeleton';
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

  useEffect(() => {
    if (endTime <= Date.now()) {
      setTimeLeft(0);
      window.dispatchEvent(new Event('storage'));
      return;
    }
    
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        window.dispatchEvent(new Event('storage'));
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

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


export function TaskManager({ username }: { username: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [penaltyEndTime, setPenaltyEndTime] = useState<number | null>(null);
  const [taskDeadline, setTaskDeadline] = useState<number | null>(null);
  const { toast } = useToast();

  const loadFromFirestore = useCallback(async () => {
    if (!username) return;
    try {
      const data = await getUserData(username);
      setTasks(data?.tasks || []);
      setPenaltyEndTime(data?.penaltyEndTime || null);
      
      // Check deadline
      const deadline = data?.taskDeadline || null;
      if (deadline && deadline < Date.now()) {
        handleDeadlinePenalty(data?.tasks || []);
      } else {
        setTaskDeadline(deadline);
      }

    } catch (error) {
      console.error("Failed to parse from Firestore", error);
      setTasks([]);
      setPenaltyEndTime(null);
      setTaskDeadline(null);
    }
  }, [username]);

  const handleDeadlinePenalty = useCallback(async (currentTasks: Task[]) => {
    const hasIncompleteTasks = currentTasks.some((t: Task) => !t.completed);
    const data = await getUserData(username);
    const isPenaltyActive = data?.penaltyEndTime && data.penaltyEndTime > Date.now();

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
    } else if (!hasIncompleteTasks) {
        // Clear deadline if all tasks are complete
        await updateUserData(username, { taskDeadline: null });
        setTaskDeadline(null);
    }
  }, [username, toast]);

  useEffect(() => {
    setIsMounted(true);
    loadFromFirestore();
    
    const storageListener = () => loadFromFirestore();
    window.addEventListener('storage', storageListener);
    
    return () => {
      window.removeEventListener('storage', storageListener);
    }
  }, [loadFromFirestore]);
  
  const updateTasksInDb = useCallback(async (newTasks: Task[]) => {
      setTasks(newTasks);
      const hasTasks = newTasks.length > 0;
      let dataToUpdate: Partial<UserData> = { tasks: newTasks };

      const userData = await getUserData(username);

      if (!hasTasks) {
          // Clear timers if no tasks left
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
      window.dispatchEvent(new Event('storage'));
  }, [username]);

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
                updateTasksInDb(newTasks); // Still save the completed state
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

            // Prepare updates
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
                
                // Skill progress
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
            window.dispatchEvent(new Event('storage'));

            toast({
              title: "Görev Tamamlandı!",
              description: <div className="flex items-center justify-center w-full gap-2 text-yellow-400"><Coins className="h-5 w-5" /><span className="font-bold">+{finalReward} Altın</span></div>
            });

        } catch (error) {
            console.error("Error completing task:", error);
        }
    } else {
      // Reverting task is complex with Firestore, for now we just update the task list
      // A more complex implementation could revert gold/xp
      updateTasksInDb(newTasks);
    }
  };
  
  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(task => task.id !== id);
    updateTasksInDb(newTasks);
  };

  if (!isMounted) {
    return (
      <FuturisticBorder>
        <div className="bg-background/90 backdrop-blur-sm p-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-8 bg-muted/20 rounded w-1/2"></Skeleton>
                <Skeleton className="h-10 bg-muted/20 rounded w-36"></Skeleton>
            </CardHeader>
            <CardContent className="space-y-4 px-2">
                <Skeleton className="h-12 bg-muted/20 rounded w-full"></Skeleton>
                <Skeleton className="h-12 bg-muted/20 rounded w-full"></Skeleton>
                <Skeleton className="h-12 bg-muted/20 rounded w-full"></Skeleton>
            </CardContent>
        </div>
      </FuturisticBorder>
    );
  }
  
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
