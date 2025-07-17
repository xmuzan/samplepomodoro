
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
  duration: number;
  onComplete: () => void;
  mode: "pomodoro" | "shortBreak" | "longBreak";
}

export const Timer = ({ duration, onComplete, mode }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      onComplete();
      setIsActive(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, onComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getAccentColor = () => {
    switch (mode) {
      case "pomodoro":
        return "text-[hsl(var(--pomodoro))]";
      case "shortBreak":
        return "text-[hsl(var(--short-break))]";
      case "longBreak":
        return "text-[hsl(var(--long-break))]";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="text-8xl font-bold font-mono tracking-tighter">
        {formatTime(timeLeft)}
      </div>
      <div className="flex items-center gap-4">
        <Button
          onClick={toggleTimer}
          className={cn(
            "w-32 text-2xl py-8 rounded-lg",
            getAccentColor().replace('text-', 'bg-'),
            "hover:opacity-90 text-primary-foreground"
          )}
        >
          {isActive ? <Pause size={32} /> : <Play size={32} />}
          <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
        </Button>
        <Button onClick={resetTimer} variant="outline" size="icon" className="h-16 w-16">
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
};
