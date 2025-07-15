import { cn } from "@/lib/utils";

interface FuturisticBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function FuturisticBorder({ children, className }: FuturisticBorderProps) {
  return (
    <div className={cn("relative p-4 futuristic-border-container", className)}>
      {/* Main Frame */}
      <span className="fb-top"></span>
      <span className="fb-bottom"></span>
      <span className="fb-left"></span>
      <span className="fb-right"></span>

      {/* Top/Bottom Details */}
      <span className="fb-top-details-1"></span>
      <span className="fb-top-details-2"></span>
      <span className="fb-bottom-details-1"></span>
      <span className="fb-bottom-details-2"></span>

      {/* Side Details */}
      <span className="fb-side-details-1"></span>
      <span className="fb-side-details-2"></span>
      
      <div className="relative z-10">{children}</div>
    </div>
  );
}
