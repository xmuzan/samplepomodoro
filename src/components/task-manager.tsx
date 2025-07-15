
'use client';

import { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskItem } from './task-item';
import { Skeleton } from './ui/skeleton';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);

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
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
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

  const addTask = (taskText: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: taskText,
      completed: false,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  if (!isMounted) {
    return (
        <Card className="border-primary/30 bg-card shadow-[0_0_20px_theme(colors.primary/0.3)]">
            <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-8 bg-muted/20 rounded w-1/2"></Skeleton>
                <Skeleton className="h-10 bg-muted/20 rounded w-36"></Skeleton>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 bg-muted/20 rounded w-full"></Skeleton>
                <Skeleton className="h-12 bg-muted/20 rounded w-full"></Skeleton>
                <Skeleton className="h-12 bg-muted/20 rounded w-full"></Skeleton>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-primary/30 bg-card shadow-[0_0_20px_theme(colors.primary/0.3)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-2xl text-accent tracking-wider">ÖZEL GÖREVLER</CardTitle>
          <CreateTaskDialog onAddTask={addTask} />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              <div className="space-y-2">
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
      </Card>
    </div>
  );
}
