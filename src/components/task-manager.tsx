
'use client';

import { useState, useEffect } from 'react';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskItem } from './task-item';
import { Skeleton } from './ui/skeleton';
import { FuturisticBorder } from './futuristic-border';
import { AlarmClock } from 'lucide-react';
import type { SkillCategory } from '@/lib/skills';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  difficulty: 'easy' | 'hard';
  reward: number;
  category: SkillCategory;
};

function PenaltyTimer({ endTime }: { endTime: number }) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    if (endTime <= Date.now()) {
      setTimeLeft(0);
      return;
    }
    
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        // TODO: Implement penalty logic here, e.g., decrease IR
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft <= 0) {
    return null;
  }

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div className="flex items-center justify-center gap-2 p-3 text-destructive">
      <AlarmClock className="h-5 w-5" />
      <p className="font-mono text-sm font-medium tracking-wider">
        CEZA SÜRESİ: {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
    </div>
  );
}


export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [penaltyEndTime, setPenaltyEndTime] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedTasks = localStorage.getItem('tasks');
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(parsedTasks);
      
      const storedPenaltyTime = localStorage.getItem('penaltyEndTime');
      if (storedPenaltyTime) {
        const endTime = parseInt(storedPenaltyTime, 10);
        if (!isNaN(endTime) && endTime > Date.now()) {
          setPenaltyEndTime(endTime);
        } else {
           localStorage.removeItem('penaltyEndTime');
        }
      }

      // Initialize user data if it doesn't exist
      if (!localStorage.getItem('userGold')) localStorage.setItem('userGold', JSON.stringify(150));
      if (!localStorage.getItem('level')) localStorage.setItem('level', JSON.stringify(0));
      if (!localStorage.getItem('attributePoints')) localStorage.setItem('attributePoints', JSON.stringify(0));
      if (!localStorage.getItem('stats')) localStorage.setItem('stats', JSON.stringify({ str: 0, vit: 0, agi: 0, int: 0, per: 0 }));
      
      if (!localStorage.getItem('tasksCompletedThisLevel')) localStorage.setItem('tasksCompletedThisLevel', JSON.stringify(0));
      const currentLevel = JSON.parse(localStorage.getItem('level') || '0');
      if (!localStorage.getItem('tasksRequiredForNextLevel')) localStorage.setItem('tasksRequiredForNextLevel', JSON.stringify(32 + currentLevel));


    } catch (error) {
      console.error("Failed to parse from localStorage", error);
       setTasks([]);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      // If there are no tasks, clear the penalty timer
      if (tasks.length === 0 && penaltyEndTime) {
        setPenaltyEndTime(null);
        localStorage.removeItem('penaltyEndTime');
      }
    }
  }, [tasks, isMounted, penaltyEndTime]);

  useEffect(() => {
    if (isMounted) {
      if (penaltyEndTime && penaltyEndTime > Date.now()) {
        localStorage.setItem('penaltyEndTime', penaltyEndTime.toString());
      } else if (penaltyEndTime) {
        localStorage.removeItem('penaltyEndTime');
      }
    }
  }, [penaltyEndTime, isMounted]);

  const updateGold = (amount: number) => {
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
    if (category === 'other') return;
  
    try {
      let skillData = JSON.parse(localStorage.getItem('skillData') || '{}');
      
      if (!skillData[category]) {
        skillData[category] = { completedTasks: 0, rankIndex: 0 };
      }
      
      skillData[category].completedTasks += 1;
      
      const TASKS_PER_RANK = 20;
      if (skillData[category].completedTasks >= TASKS_PER_RANK) {
        if(skillData[category].rankIndex < 9) { // Max rank is 9 (index)
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
    try {
        let tasksCompleted = JSON.parse(localStorage.getItem('tasksCompletedThisLevel') || '0');
        tasksCompleted += 1;

        let level = JSON.parse(localStorage.getItem('level') || '0');
        let tasksRequired = JSON.parse(localStorage.getItem('tasksRequiredForNextLevel') || `${32 + level}`);

        if (tasksCompleted >= tasksRequired) {
            level += 1;
            tasksCompleted = 0; // Reset for next level
            tasksRequired = 32 + level; // New requirement

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
    
    // If this is the very first task being added (or the list was empty)
    // and there's no active penalty timer, start one.
    if (tasks.length === 0 && !penaltyEndTime) {
        const endTime = Date.now() + 24 * 60 * 60 * 1000;
        setPenaltyEndTime(endTime);
    }
    
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => {
        if (task.id === id) {
            const wasCompleted = task.completed;
            const updatedTask = { ...task, completed: !task.completed };
            
            if (updatedTask.completed && !wasCompleted) {
                updateGold(updatedTask.reward);
                handleTaskCompletionProgress(updatedTask.category);
            } else if (!updatedTask.completed && wasCompleted) {
                updateGold(-updatedTask.reward);
                // Note: We might not want to decrement level progress on un-checking. 
                // This is a design choice. For now, we won't decrement.
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
      // Optional: Decrement completion count if a completed task is deleted.
    }
    setTasks(tasks.filter(task => task.id !== id));
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

  const hasIncompleteTasks = tasks.some(task => !task.completed);

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
        {penaltyEndTime && hasIncompleteTasks && (
          <div className="p-2 pt-0">
            <PenaltyTimer endTime={penaltyEndTime} />
          </div>
        )}
        </div>
      </FuturisticBorder>
    </div>
  );
}
