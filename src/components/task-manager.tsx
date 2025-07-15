
'use client';

import { useState, useEffect, useCallback } from 'react';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskItem } from './task-item';
import { Skeleton } from './ui/skeleton';
import { FuturisticBorder } from './futuristic-border';
import { AlarmClock } from 'lucide-react';
import type { SkillCategory } from '@/lib/skills';
import { useToast } from '@/hooks/use-toast';

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


export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [penaltyEndTime, setPenaltyEndTime] = useState<number | null>(null);
  const [taskDeadline, setTaskDeadline] = useState<number | null>(null);
  const { toast } = useToast();

  const loadFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedTasks = localStorage.getItem('tasks');
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(parsedTasks);

      const storedPenaltyTime = localStorage.getItem('penaltyEndTime');
      if (storedPenaltyTime) {
        const endTime = parseInt(storedPenaltyTime, 10);
        if (endTime > Date.now()) {
          setPenaltyEndTime(endTime);
        } else {
          localStorage.removeItem('penaltyEndTime');
          setPenaltyEndTime(null);
        }
      } else {
        setPenaltyEndTime(null);
      }

      const storedDeadline = localStorage.getItem('taskDeadline');
      if (storedDeadline) {
        const deadline = parseInt(storedDeadline, 10);
        if (deadline > Date.now()) {
           setTaskDeadline(deadline);
        } else {
            localStorage.removeItem('taskDeadline');
            setTaskDeadline(null);
            
            const hasIncompleteTasks = parsedTasks.some((t: Task) => !t.completed);
            const isPenaltyActive = localStorage.getItem('penaltyEndTime');

            if (hasIncompleteTasks && !isPenaltyActive) {
                const newPenaltyTime = Date.now() + 24 * 60 * 60 * 1000;
                localStorage.setItem('penaltyEndTime', newPenaltyTime.toString());
                setPenaltyEndTime(newPenaltyTime);
                toast({
                    title: "Ceza Görevi Başladı!",
                    description: "Görevleri zamanında tamamlayamadın. 24 saatliğine özelliklerin kilitlendi.",
                    variant: "destructive"
                });
            }
        }
      } else {
        setTaskDeadline(null);
      }

    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setTasks([]);
      setPenaltyEndTime(null);
      setTaskDeadline(null);
    }
  }, [toast]);


  useEffect(() => {
    setIsMounted(true);
    loadFromStorage();
    
    window.addEventListener('storage', loadFromStorage);
    return () => {
      window.removeEventListener('storage', loadFromStorage);
    }
  }, [loadFromStorage]);
  
  useEffect(() => {
    if (!isMounted) return;

    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    if (tasks.length === 0) {
        if (localStorage.getItem('taskDeadline') || localStorage.getItem('penaltyEndTime')) {
            localStorage.removeItem('taskDeadline');
            localStorage.removeItem('penaltyEndTime');
            setTaskDeadline(null);
            setPenaltyEndTime(null);
            window.dispatchEvent(new Event('storage'));
        }
        return;
    }

    const isPenaltyActive = penaltyEndTime && penaltyEndTime > Date.now();
    const hasIncompleteTasks = tasks.some(task => !task.completed);
    
    if (!hasIncompleteTasks) {
        if (localStorage.getItem('taskDeadline')) {
            localStorage.removeItem('taskDeadline');
            setTaskDeadline(null);
            if (taskDeadline) { 
                toast({ title: "Tüm Görevler Tamamlandı!", description: "Ceza görevi başarıyla önlendi." });
            }
            window.dispatchEvent(new Event('storage'));
        }
    }
    else if (hasIncompleteTasks && !taskDeadline && !isPenaltyActive) {
        const newDeadline = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('taskDeadline', newDeadline.toString());
        setTaskDeadline(newDeadline);
        window.dispatchEvent(new Event('storage'));
    }
    
  }, [tasks, isMounted, toast, penaltyEndTime, taskDeadline]);


  const updateGold = (amount: number) => {
    const isPenaltyActive = penaltyEndTime && penaltyEndTime > Date.now();
    if (isPenaltyActive) return;
    try {
      const currentGold = JSON.parse(localStorage.getItem('userGold') || '0');
      const newGold = currentGold + amount;
      localStorage.setItem('userGold', JSON.stringify(newGold));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Failed to update gold in localStorage", error);
    }
  }
  
  const handleSkillProgress = (category: SkillCategory) => {
    const isPenaltyActive = penaltyEndTime && penaltyEndTime > Date.now();
    if (isPenaltyActive || category === 'other') return;
  
    try {
      let skillData = JSON.parse(localStorage.getItem('skillData') || '{}');
      
      if (!skillData[category]) {
        skillData[category] = { completedTasks: 0, rankIndex: 0 };
      }
      
      skillData[category].completedTasks += 1;
      
      const TASKS_PER_RANK = 20;
      if (skillData[category].completedTasks >= TASKS_PER_RANK) {
        if(skillData[category].rankIndex < 9) {
            skillData[category].rankIndex += 1;
            skillData[category].completedTasks = 0;
        }
      }
      
      localStorage.setItem('skillData', JSON.stringify(skillData));
      window.dispatchEvent(new Event('storage'));
    } catch(error) {
      console.error("Failed to update skill data in localStorage", error);
    }
  };


  const handleTaskCompletionProgress = (category: SkillCategory) => {
    const isPenaltyActive = penaltyEndTime && penaltyEndTime > Date.now();
    if (isPenaltyActive) return;
    try {
        let tasksCompleted = JSON.parse(localStorage.getItem('tasksCompletedThisLevel') || '0');
        tasksCompleted += 1;

        let level = JSON.parse(localStorage.getItem('level') || '0');
        let tasksRequired = JSON.parse(localStorage.getItem('tasksRequiredForNextLevel') || `${32 + level}`);

        if (tasksCompleted >= tasksRequired) {
            level += 1;
            tasksCompleted = 0;
            tasksRequired = 32 + level;

            localStorage.setItem('level', JSON.stringify(level));
            localStorage.setItem('tasksRequiredForNextLevel', JSON.stringify(tasksRequired));

            let attributePoints = JSON.parse(localStorage.getItem('attributePoints') || '0');
            attributePoints += 1;
            localStorage.setItem('attributePoints', JSON.stringify(attributePoints));
        }

        localStorage.setItem('tasksCompletedThisLevel', JSON.stringify(tasksCompleted));
        handleSkillProgress(category);
        window.dispatchEvent(new Event('storage'));
    } catch(error) {
      console.error("Failed to update level/points in localStorage", error);
    }
  };

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
    
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => {
        if (task.id === id) {
            const wasCompleted = task.completed;
            const updatedTask = { ...task, completed: !task.completed };
            
            const isPenaltyActiveNow = penaltyEndTime && penaltyEndTime > Date.now();
            
            if (updatedTask.completed && !wasCompleted) {
                if(!isPenaltyActiveNow){
                  updateGold(updatedTask.reward);
                  handleTaskCompletionProgress(updatedTask.category);
                } else {
                  toast({
                    title: "Ceza Aktif!",
                    description: "Ceza süresi bitene kadar ödül kazanamazsın.",
                    variant: "destructive"
                  });
                }
            } else if (!updatedTask.completed && wasCompleted) {
                updateGold(-updatedTask.reward);
            }
            return updatedTask;
        }
        return task;
    }));
  };
  
  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (taskToDelete && taskToDelete.completed) {
      updateGold(-taskToDelete.reward);
    }
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
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
  
  const renderTimer = () => {
    const isPenaltyActive = penaltyEndTime && penaltyEndTime > Date.now();
    if (isPenaltyActive) {
      return <TimerDisplay endTime={penaltyEndTime!} isPenalty={true} />;
    }

    const isDeadlineActive = taskDeadline && taskDeadline > Date.now() && tasks.some(t => !t.completed);
    if (isDeadlineActive) {
      return <TimerDisplay endTime={taskDeadline!} isPenalty={false} />;
    }
    
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <FuturisticBorder>
       <div className="bg-background/90 backdrop-blur-sm p-1">
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
        
        {renderTimer()}

        </div>
      </FuturisticBorder>
    </div>
  );
}
