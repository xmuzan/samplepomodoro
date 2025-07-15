
'use client';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Trash2 } from 'lucide-react';
import type { Task } from './task-manager';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div
      className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors group"
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-background"
        aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
      />
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          "flex-1 cursor-pointer transition-colors",
          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
        )}
      >
        {task.text}
      </label>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
