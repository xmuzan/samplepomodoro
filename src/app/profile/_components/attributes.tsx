import { Dumbbell, Shield, Wind, Brain, Eye } from "lucide-react";

interface AttributesProps {
  stats: {
    str: number;
    vit: number;
    agi: number;
    int: number;
    per: number;
  };
}

const attributeData = [
  { key: 'str', label: 'STR', icon: Dumbbell },
  { key: 'vit', label: 'VIT', icon: Shield },
  { key: 'agi', label: 'AGI', icon: Wind },
  { key: 'int', label: 'INT', icon: Brain },
  { key: 'per', label: 'PER', icon: Eye },
];

export function Attributes({ stats }: AttributesProps) {
  return (
    <div className="attribute-grid">
      {attributeData.map(({ key, label, icon: Icon }) => (
        <div key={key} className="attribute-item">
          <Icon className="h-6 w-6 icon" />
          <span className="flex-1 text-lg font-semibold text-muted-foreground">{label}</span>
          <span className="text-xl font-mono font-bold text-foreground">
            {stats[key as keyof typeof stats]}
          </span>
        </div>
      ))}
    </div>
  );
}
