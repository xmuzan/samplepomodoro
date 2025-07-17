
'use client';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Trash2 } from 'lucide-react';
import type { Task } from './task-manager';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  isPending: boolean;
}

export function TaskItem({ task, onToggle, onDelete, isPending }: TaskItemProps) {
  return (
    <div
      className="tech-task-item group flex items-center gap-4"
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={onToggle}
        className="size-5 rounded-sm border-primary/50 text-primary data-[state=checked]:bg-primary/20 data-[state=checked]:text-primary data-[state=checked]:border-primary"
        aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
        disabled={isPending}
      />
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          "flex-1 cursor-pointer transition-colors",
          task.completed ? 'line-through text-muted-foreground/80' : 'text-foreground',
          isPending ? 'cursor-not-allowed opacity-50' : ''
        )}
      >
        {task.text}
      </label>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
        onClick={onDelete}
        aria-label="Delete task"
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
