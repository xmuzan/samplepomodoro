import { HeartPulse, FlaskConical, BrainCircuit } from "lucide-react";

interface Stat {
  current: number;
  max: number;
}

interface StatBarsProps {
  hp: Stat;
  mp: Stat;
  ir: Stat;
}

function StatBar({ label, icon: Icon, value, max, colorClass, unit }: { label: string, icon: React.ElementType, value: number, max: number, colorClass: string, unit: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="stat-bar-container">
      <div className="flex items-center gap-2 w-16">
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-bold text-sm uppercase">{label}</span>
      </div>
      <div className="relative w-full">
        <div className="stat-bar">
          <div 
            className={`stat-bar-fill ${colorClass}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono text-white/90 text-shadow-sm">
            {value}{unit} / {max}{unit}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StatBars({ hp, mp, ir }: StatBarsProps) {
  return (
    <div className="space-y-3">
      <StatBar label="HP" icon={HeartPulse} value={hp.current} max={hp.max} colorClass="stat-bar-fill-hp" unit="%" />
      <StatBar label="MP" icon={FlaskConical} value={mp.current} max={mp.max} colorClass="stat-bar-fill-mp" unit="%" />
      <StatBar label="IR" icon={BrainCircuit} value={ir.current} max={ir.max} colorClass="stat-bar-fill-ir" unit="%" />
    </div>
  );
}
