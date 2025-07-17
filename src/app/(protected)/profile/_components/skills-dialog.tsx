
'use client';

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FuturisticBorder } from "@/components/futuristic-border";
import { SKILL_CATEGORIES, type SkillCategory, type SkillData } from "@/lib/skills";
import { Progress } from "@/components/ui/progress";
import { getUserData } from "@/lib/userData";
import { getCurrentUser } from "@/lib/auth";

interface SkillsDialogProps {
  children: React.ReactNode;
}

const TASKS_PER_RANK = 20;

export function SkillsDialog({ children }: SkillsDialogProps) {
  const [skillData, setSkillData] = useState<SkillData>({});
  const [isMounted, setIsMounted] = useState(false);
  const currentUser = getCurrentUser();

  const fetchSkillData = async () => {
    if (!currentUser) return;
    try {
        const data = await getUserData(currentUser.username);
        setSkillData(data?.skillData || {});
    } catch (error) {
      console.error("Failed to parse skill data from Firestore", error);
      setSkillData({});
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchSkillData();

    const handleStorageChange = () => {
      fetchSkillData();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open && isMounted) {
      fetchSkillData();
    }
  };
  
  if (!isMounted) {
    return <>{children}</>;
  }

  const skillEntries = Object.entries(SKILL_CATEGORIES).filter(([key]) => key !== 'other');

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-2xl">
        <FuturisticBorder>
          <div className="bg-background/90 backdrop-blur-sm p-1">
            <DialogHeader className="p-6">
              <DialogTitle className="font-headline text-purple-400 text-glow">Yetenekler</DialogTitle>
              <DialogDescription>
                Farklı alanlardaki ustalığını ve rütbelerini gör. Rütbe atlamak için her kategoride 20 görev tamamla.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto px-6 pb-6">
              <div className="space-y-6">
                {skillEntries.map(([key, category]) => {
                  const currentData = skillData[key as SkillCategory] || { completedTasks: 0, rankIndex: 0 };
                  const currentRank = category.ranks[currentData.rankIndex];
                  const progress = (currentData.completedTasks / TASKS_PER_RANK) * 100;

                  return (
                    <div key={key}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-foreground text-lg">{category.label}</h4>
                        <span className="text-sm font-mono text-purple-300">{currentRank}</span>
                      </div>
                      <Progress value={progress} className="h-2 [&>div]:bg-purple-500" />
                       <p className="text-xs text-muted-foreground text-right mt-1">
                          Sonraki Rütbe: {currentData.completedTasks}/{TASKS_PER_RANK}
                       </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </FuturisticBorder>
      </DialogContent>
    </Dialog>
  );
}
