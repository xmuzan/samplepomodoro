
'use client';

import { Button } from "@/components/ui/button";
import { Coins, Star, ShieldQuestion, LogOut } from "lucide-react";
import { InventoryDialog } from "./inventory-dialog";
import type { ShopItemData } from "@/app/(protected)/shop/_components/shop-item";
import { SkillsDialog } from "./skills-dialog";
import { logoutAction } from "@/app/login/actions";
import { useRouter } from "next/navigation";

interface FooterActionsProps {
  gold: number;
  shopItems: ShopItemData[];
  availablePoints: number;
}

export function FooterActions({ gold, shopItems, availablePoints }: FooterActionsProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    // The redirect is handled within logoutAction, but a router.refresh() can be good practice
    // in case the action is modified later. However, for a logout, it's not strictly necessary.
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
      <div className="flex items-center gap-2 text-lg font-mono p-2 rounded-md bg-muted/20">
        <Coins className="h-6 w-6 text-yellow-400 text-glow" />
        <span className="font-bold text-yellow-200">{new Intl.NumberFormat().format(gold)}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <SkillsDialog>
            <Button 
                size="lg" 
                className="gap-2 bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_#a855f7] w-full relative"
            >
                <Star className="h-6 w-6" />
                Yetenekler
                {availablePoints > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold animate-pulse">
                        {availablePoints}
                    </span>
                )}
            </Button>
        </SkillsDialog>
        <InventoryDialog shopItems={shopItems}>
          <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_15px_hsl(var(--primary)/0.5)] w-full">
            <ShieldQuestion className="h-6 w-6" />
            Envanter
          </Button>
        </InventoryDialog>
        <Button size="lg" variant="destructive" onClick={handleLogout} className="gap-2 w-full">
            <LogOut className="h-6 w-6" />
            Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
