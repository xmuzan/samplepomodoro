
"use client";

import { useState, useEffect } from "react";
import { Timer } from "@/components/timer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export default function Home() {
  const [mode, setMode] = useState<TimerMode>("pomodoro");

  const modeDurations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const [key, setKey] = useState(0); // Used to reset the timer

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setKey((prevKey) => prevKey + 1); // Change key to force re-mount of Timer
  };

  const handleTimerComplete = () => {
    // A simple notification to let the user know the timer is done
    alert(`${mode} session complete!`);
    // You could add logic here to automatically switch to the next mode
  };
  
  const getBackgroundColor = (currentMode: TimerMode) => {
    switch (currentMode) {
      case "pomodoro":
        return "bg-red-500/10 border-red-500/20";
      case "shortBreak":
        return "bg-green-500/10 border-green-500/20";
      case "longBreak":
        return "bg-blue-500/10 border-blue-500/20";
      default:
        return "bg-card";
    }
  };


  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-500",
        {
          "bg-[hsl(var(--pomodoro))]": mode === "pomodoro",
          "bg-[hsl(var(--short-break))]": mode === "shortBreak",
          "bg-[hsl(var(--long-break))]": mode === "longBreak",
        }
      )}
    >
      <Card className="w-full max-w-md bg-background/50 backdrop-blur-sm border-foreground/20">
        <CardContent className="p-6">
          <Tabs
            defaultValue="pomodoro"
            className="w-full"
            onValueChange={(value) => handleModeChange(value as TimerMode)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
              <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
              <TabsTrigger value="longBreak">Long Break</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-6">
            <Timer
              key={key}
              duration={modeDurations[mode]}
              onComplete={handleTimerComplete}
              mode={mode}
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
