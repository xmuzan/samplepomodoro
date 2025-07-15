import { Button } from "@/components/ui/button";
import { ShieldQuestion, Coins, Star } from "lucide-react";
import { InventoryDialog } from "./inventory-dialog";
import type { ShopItemData } from "@/app/shop/_components/shop-item";

interface FooterActionsProps {
  gold: number;
  shopItems: ShopItemData[];
}

export function FooterActions({ gold, shopItems }: FooterActionsProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
      <div className="flex items-center gap-2 text-lg font-mono p-2 rounded-md bg-muted/20">
        <Coins className="h-6 w-6 text-yellow-400 text-glow" />
        <span className="font-bold text-yellow-200">{new Intl.NumberFormat().format(gold)}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <Button size="lg" className="gap-2 bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_#a855f7] w-full">
            <Star className="h-6 w-6" />
            Yetenekler
        </Button>
        <InventoryDialog shopItems={shopItems}>
          <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_15px_hsl(var(--primary)/0.5)] w-full">
            <ShieldQuestion className="h-6 w-6" />
            Envanter
          </Button>
        </InventoryDialog>
      </div>
    </div>
  );
}
