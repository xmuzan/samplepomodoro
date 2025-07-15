
'use client';

import { useState, useEffect } from 'react';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskItem } from './task-item';
import { Skeleton } from './ui/skeleton';
import { FuturisticBorder } from './futuristic-border';
import { AlarmClock } from 'lucide-react';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
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
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks([
          { id: '1', text: 'Daily Workout: 100 Push-ups, 100 Sit-ups', completed: true },
          { id: '2', text: 'Read a chapter of a new book', completed: false },
          { id: '3', text: 'Practice a new skill for 30 minutes', completed: false },
        ]);
      }
      
      const storedPenaltyTime = localStorage.getItem('penaltyEndTime');
      if (storedPenaltyTime) {
        const endTime = parseInt(storedPenaltyTime, 10);
        if (!isNaN(endTime) && endTime > Date.now()) {
          setPenaltyEndTime(endTime);
        }
      }

    } catch (error) {
      console.error("Failed to parse from localStorage", error);
       setTasks([
          { id: '1', text: 'Daily Workout: 100 Push-ups, 100 Sit-ups', completed: true },
          { id: '2', text: 'Read a chapter of a new book', completed: false },
          { id: '3', text: 'Practice a new skill for 30 minutes', completed: false },
        ]);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  useEffect(() => {
    if (isMounted) {
      if (penaltyEndTime && penaltyEndTime > Date.now()) {
        localStorage.setItem('penaltyEndTime', penaltyEndTime.toString());
      } else {
        localStorage.removeItem('penaltyEndTime');
      }
    }
  }, [penaltyEndTime, isMounted]);

  const addTask = (taskText: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: taskText,
      completed: false,
    };
    setTasks(prev => [newTask, ...prev]);

    const endTime = Date.now() + 24 * 60 * 60 * 1000;
    setPenaltyEndTime(endTime);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };
  
  const deleteTask = (id: string) => {
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
        {penaltyEndTime && tasks.length > 0 && (
          <div className="p-2 pt-0">
            <PenaltyTimer endTime={penaltyEndTime} />
          </div>
        )}
        </div>
      </FuturisticBorder>
    </div>
  );
}
