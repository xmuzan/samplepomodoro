
'use client';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

export interface ShopItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  aiHint: string;
}

interface ShopItemProps {
  item: ShopItemData;
  currentGold: number;
  onPurchase: (item: ShopItemData) => void;
}

export function ShopItem({ item, currentGold, onPurchase }: ShopItemProps) {
  const canAfford = currentGold >= item.price;

  return (
    <div className="shop-item-card group">
      <div className="shop-item-border"></div>
      <div className="relative z-10 p-4 flex flex-col h-full">
        <div className="relative mb-4 aspect-video overflow-hidden rounded-md">
          <Image 
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={item.aiHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
        
        <h3 className="text-lg font-headline text-primary text-glow mb-2">{item.name}</h3>
        <p className="text-sm text-muted-foreground flex-grow mb-4">{item.description}</p>
        
        <div className="mt-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-mono text-yellow-400 text-glow">
            <Coins className="h-4 w-4" />
            <span className="font-bold">{item.price}</span>
          </div>
          <Button 
            size="sm"
            disabled={!canAfford}
            onClick={() => onPurchase(item)}
            className="bg-primary/10 border border-primary/50 text-primary hover:bg-primary/20 disabled:bg-muted/20 disabled:text-muted-foreground disabled:border-muted/30 disabled:cursor-not-allowed"
          >
            Satın Al
          </Button>
        </div>
      </div>
    </div>
  );
}
