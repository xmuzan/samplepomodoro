
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Store, Swords, User, FileText, Lock, Crown, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { User as AuthUser } from '@/types';

import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const baseNavItems = [
  { href: '/tasks', label: 'Görevler', icon: Swords },
  { href: '/profile', label: 'Profil', icon: User },
  { href: '/shop', label: 'Mağaza', icon: Store },
  { href: '/report', label: 'Rapor', icon: FileText },
  { href: '/boss', label: 'Boss', icon: Crown },
];

const adminNavItem = { href: '/admin', label: 'Yönetim', icon: Shield };

export function Navbar() {
  const pathname = usePathname();
  const [isPenaltyActive, setIsPenaltyActive] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const checkUser = () => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
    }
    
    checkUser();
    window.addEventListener('storage', checkUser);

    return () => {
        window.removeEventListener('storage', checkUser);
    }
  }, []);

  useEffect(() => {
    const checkPenalty = () => {
      const penaltyEndTime = localStorage.getItem('penaltyEndTime');
      if (penaltyEndTime && parseInt(penaltyEndTime) > Date.now()) {
        setIsPenaltyActive(true);
      } else {
        setIsPenaltyActive(false);
      }
    };

    checkPenalty();
    window.addEventListener('storage', checkPenalty);
    const interval = setInterval(checkPenalty, 1000);

    return () => {
      window.removeEventListener('storage', checkPenalty);
      clearInterval(interval);
    };
  }, []);

  const navItems = user?.isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  const commonLinkClasses = "flex items-center justify-center gap-1 rounded-md transition-colors duration-200 md:justify-start md:w-full md:h-12 md:px-3";
  const activeClasses = "text-primary bg-primary/10";
  const inactiveClasses = "text-muted-foreground hover:bg-primary/5 hover:text-primary";
  const iconGlow = "drop-shadow-[0_0_8px_hsl(var(--primary))]";
  
  return (
    <>
      {/* Bottom Navbar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/20 bg-background/80 p-1 backdrop-blur-lg md:hidden">
        <div className="flex justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isShop = label === 'Mağaza';
            const isBoss = label === 'Boss';
            return (
              <Link 
                key={label} 
                href={href} 
                className={cn(
                  commonLinkClasses,
                  pathname.startsWith(href) && href !== '/' || pathname === href ? activeClasses : inactiveClasses,
                  'flex-col text-xs h-14 relative w-full'
              )}>
                <Icon className={cn('h-6 w-6 lucide-icon', pathname.startsWith(href) && iconGlow)} />
                <span>{label}</span>
                {isShop && isPenaltyActive && <Lock className="absolute top-1 right-1 h-3 w-3 text-destructive" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Sidebar for desktop */}
      <TooltipProvider>
        <nav className="hidden md:fixed md:left-0 md:top-0 md:z-50 md:flex md:h-screen md:w-20 md:flex-col md:border-r md:border-primary/20 md:bg-background/90 backdrop-blur-sm lg:w-64">
            <div className="flex h-20 items-center justify-center border-b border-primary/20">
                <Link href="/" className="flex items-center justify-center">
                    <Bot className={cn("h-8 w-8 text-primary", iconGlow)} />
                    <span className="font-headline ml-4 hidden text-xl font-bold text-primary lg:block">Sistem</span>
                </Link>
            </div>
            <div className="flex flex-1 flex-col gap-y-2 overflow-y-auto p-2">
                <ul className="flex flex-col gap-2">
                    {navItems.map(({ href, label, icon: Icon }) => {
                       const isShop = label === 'Mağaza';
                       const isActive = pathname.startsWith(href) && href !== '/' || pathname === href;
                       return (
                        <li key={label}>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Link href={href} className={cn(
                                    commonLinkClasses,
                                    isActive ? activeClasses : inactiveClasses,
                                    "relative"
                                  )}>
                                      <Icon className={cn('h-6 w-6 shrink-0 lucide-icon', isActive && iconGlow)} />
                                      <span className="hidden lg:block">{label}</span>
                                      {isShop && isPenaltyActive && <Lock className="h-4 w-4 text-destructive absolute right-3 lg:right-2" />}
                                  </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="lg:hidden futuristic-card !p-2 !border-primary/50">
                                <p>{label}</p>
                              </TooltipContent>
                           </Tooltip>
                        </li>
                       )
                    })}
                </ul>
            </div>
        </nav>
      </TooltipProvider>
    </>
  );
}
