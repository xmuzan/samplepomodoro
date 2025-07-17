
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
import { updateUserData, UserData } from '@/lib/userData';
import { getTierForLevel } from '@/lib/ranks';

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
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setTasks(initialUserData?.tasks || []);
  }, [initialUserData]);

  const updateTasksAndDeadline = useCallback(async (newTasks: Task[], currentData: UserData) => {
    setTasks(newTasks);
    const hasTasks = newTasks.length > 0;
    let dataToUpdate: Partial<UserData> = { tasks: newTasks };
    
    if (!hasTasks) {
        dataToUpdate.taskDeadline = null;
    } else {
      const hasIncompleteTasks = newTasks.some(task => !task.completed);
      const isPenaltyActive = currentData.penaltyEndTime && currentData.penaltyEndTime > Date.now();
      
      if (hasIncompleteTasks && !currentData.taskDeadline && !isPenaltyActive) {
          dataToUpdate.taskDeadline = Date.now() + 24 * 60 * 60 * 1000;
      } else if (!hasIncompleteTasks) {
          dataToUpdate.taskDeadline = null;
      }
    }
    
    await updateUserData(username, dataToUpdate);
    router.refresh();
  }, [username, router]);


  const addTask = (taskText: string, difficulty: 'easy' | 'hard', category: SkillCategory) => {
    if (!initialUserData) return;
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
    updateTasksAndDeadline(newTasks, initialUserData);
  };

  const toggleTask = async (id: string) => {
    if (!initialUserData) return;

    const taskToToggle = tasks.find(task => task.id === id);
    if (!taskToToggle) return;

    const isNowCompleted = !taskToToggle.completed;

    const newTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: isNowCompleted } : task
    );
    
    setTasks(newTasks); // Optimistic UI update

    try {
        const userData = initialUserData;
        const updates: Partial<UserData> = { tasks: newTasks };

        // --- SKILL DATA LOGIC ---
        const skillData = JSON.parse(JSON.stringify(userData.skillData || {}));
        const category = taskToToggle.category;
        if (category !== 'other') {
            const TASKS_PER_RANK = 20;
            if (!skillData[category]) skillData[category] = { completedTasks: 0, rankIndex: 0 };
            const skill = skillData[category]!;

            if (isNowCompleted) {
                skill.completedTasks += 1;
                if (skill.completedTasks >= TASKS_PER_RANK && skill.rankIndex < 9) {
                    skill.rankIndex += 1;
                    skill.completedTasks = 0;
                }
            } else {
                if (skill.completedTasks > 0) {
                    skill.completedTasks -= 1;
                } else if (skill.rankIndex > 0) {
                    skill.rankIndex -= 1;
                    skill.completedTasks = TASKS_PER_RANK - 1;
                }
            }
        }
        updates.skillData = skillData;

        if (isNowCompleted) {
            // --- LOGIC FOR COMPLETING A TASK ---
            const isPenaltyActiveNow = userData.penaltyEndTime && userData.penaltyEndTime > Date.now();
            if(isPenaltyActiveNow) {
                toast({
                  title: "Ceza Aktif!",
                  description: "Ceza süresi bitene kadar ödül kazanamazsın.",
                  variant: "destructive"
                });
                await updateUserData(username, { tasks: newTasks, skillData: updates.skillData });
                router.refresh();
                return;
            }

            let finalReward = taskToToggle.reward;
            let canLevelUp = true;
            
            if (userData.baseStats.hp <= 0) {
                finalReward = Math.round(taskToToggle.reward * 0.1);
                toast({ title: "HP Sıfır!", description: "Altın kazanımı %90 azaldı.", variant: "destructive" });
            }
            if (userData.baseStats.mp <= 0) {
                canLevelUp = false;
                toast({ title: "MP Sıfır!", description: "Seviye ilerlemesi durduruldu.", variant: "destructive" });
            }

            updates.userGold = (userData.userGold || 0) + finalReward;

            if (canLevelUp) {
                let { level, tasksCompletedThisLevel, tasksRequiredForNextLevel, attributePoints } = userData;
                
                tasksCompletedThisLevel = (tasksCompletedThisLevel || 0) + 1;

                if (tasksCompletedThisLevel >= tasksRequiredForNextLevel) {
                    level += 1;
                    tasksCompletedThisLevel = 0;
                    tasksRequiredForNextLevel = 32 + level;
                    attributePoints = (attributePoints || 0) + 1;
                }
                
                updates.level = level;
                updates.tier = getTierForLevel(level);
                updates.tasksCompletedThisLevel = tasksCompletedThisLevel;
                updates.tasksRequiredForNextLevel = tasksRequiredForNextLevel;
                updates.attributePoints = attributePoints;
            }
            
            if (!newTasks.some(t => !t.completed)) {
              updates.taskDeadline = null;
            }
            
            toast({
              title: "Görev Tamamlandı!",
              description: <div className="flex items-center justify-center w-full gap-2 text-yellow-400"><Coins className="h-5 w-5" /><span className="font-bold">+{finalReward} Altın</span></div>
            });

        } else {
            // --- LOGIC FOR UN-COMPLETING A TASK ---
            const { tasksCompletedThisLevel = 0, userGold = 0 } = userData;
            
            if (tasksCompletedThisLevel > 0) {
                updates.tasksCompletedThisLevel = tasksCompletedThisLevel - 1;
            }
            
            updates.userGold = Math.max(0, userGold - taskToToggle.reward);
            
            toast({
              title: "Görev Geri Alındı",
              description: `İlerlemeniz ve ${taskToToggle.reward} altın geri alındı.`
            });
        }

        await updateUserData(username, updates);

    } catch (error) {
        console.error("Error toggling task:", error);
        setTasks(tasks); // Revert optimistic update on error
        toast({ title: "Hata", description: "Görev durumu güncellenemedi.", variant: "destructive" });
    } finally {
       router.refresh();
    }
  };
  
  const deleteTask = (id: string) => {
    if (!initialUserData) return;
    const newTasks = tasks.filter(task => task.id !== id);
    updateTasksAndDeadline(newTasks, initialUserData);
  };
  
  const isPenaltyActive = initialUserData?.penaltyEndTime && initialUserData.penaltyEndTime > Date.now();
  const isDeadlineActive = initialUserData?.taskDeadline && initialUserData.taskDeadline > Date.now() && tasks.some(t => !t.completed);

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
