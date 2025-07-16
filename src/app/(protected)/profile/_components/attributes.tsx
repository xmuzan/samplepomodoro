
'use client';
import { Dumbbell, Shield, Wind, Brain, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateUserData } from "@/lib/userData";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AttributesProps {
  stats: {
    str: number;
    vit: number;
    agi: number;
    int: number;
    per: number;
  };
  attributePoints: number;
}

const attributeData = [
  { key: 'str', label: 'STR', icon: Dumbbell },
  { key: 'vit', label: 'VIT', icon: Shield },
  { key: 'agi', label: 'AGI', icon: Wind },
  { key: 'int', label: 'INT', icon: Brain },
  { key: 'per', label: 'PER', icon: Eye },
];

export function Attributes({ stats, attributePoints }: AttributesProps) {
  const router = useRouter();
  const currentUser = getCurrentUser();

  const handleSpendPoint = async (statKey: keyof AttributesProps['stats']) => {
    if (!currentUser?.username || attributePoints <= 0) return;
    
    const newPoints = attributePoints - 1;
    const newStats = { ...stats, [statKey]: (stats?.[statKey] || 0) + 1 };
    
    await updateUserData(currentUser.username, { 
        attributePoints: newPoints,
        stats: newStats
    });

    router.refresh();
  };

  const canUpgrade = attributePoints > 0;

  return (
    <div className="attribute-grid">
      {attributeData.map(({ key, label, icon: Icon }) => (
        <div key={key} className="attribute-item">
          <Icon className="h-6 w-6 icon" />
          <span className="flex-1 text-lg font-semibold text-muted-foreground">{label}</span>
          <span className="text-xl font-mono font-bold text-foreground w-8 text-right">
            {stats[key as keyof typeof stats]}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-primary hover:bg-primary/20 hover:text-primary disabled:text-muted-foreground/30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            onClick={() => handleSpendPoint(key as keyof typeof stats)}
            disabled={!canUpgrade}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
