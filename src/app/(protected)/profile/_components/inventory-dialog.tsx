
'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FuturisticBorder } from "@/components/futuristic-border";
import type { ShopItemData } from "@/app/(protected)/shop/_components/shop-item";
import { updateStats } from "@/lib/stats";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  quantity: number;
}

interface InventoryDialogProps {
  children: React.ReactNode;
  shopItems: ShopItemData[];
}

export function InventoryDialog({ children, shopItems }: InventoryDialogProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const fetchInventory = () => {
    try {
      const storedInventory = localStorage.getItem('inventory');
      setInventory(storedInventory ? JSON.parse(storedInventory) : []);
    } catch (error) {
      console.error("Failed to parse inventory from localStorage", error);
      setInventory([]);
    }
  }

  useEffect(() => {
    setIsMounted(true);
    fetchInventory();
  }, []);

  const handleUseItem = (itemId: string) => {
    const itemData = shopItems.find(item => item.id === itemId);
    if (!itemData) return;
    
    switch(itemId) {
      case 'potion_energy':
        updateStats({ hp: 10 });
        toast({ title: "Enerji Yenilendi", description: "HP %10 yenilendi." });
        break;
      case 'potion_mind':
        updateStats({ mp: 15 });
        toast({ title: "Zihin Canlandı", description: "MP %15 yenilendi." });
        break;
      default:
         toast({ title: itemData.name, description: "Bu eşya bir eylemi tamamlamak için kullanılır." });
    }

    let updatedInventory = [...inventory];
    const itemIndex = updatedInventory.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
      updatedInventory[itemIndex].quantity -= 1;
      if (updatedInventory[itemIndex].quantity <= 0) {
        updatedInventory = updatedInventory.filter(item => item.id !== itemId);
      }
      setInventory(updatedInventory);
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (open && isMounted) {
      fetchInventory();
    }
  };

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-2xl">
        <FuturisticBorder>
          <div className="bg-background/90 backdrop-blur-sm p-1">
            <DialogHeader className="p-6">
              <DialogTitle className="font-headline text-primary text-glow">Envanter</DialogTitle>
              <DialogDescription>
                Görevlerden kazandığın altınlarla aldığın eşyalar.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto px-6 pb-6">
              {inventory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inventory.map(invItem => {
                    const shopItem = shopItems.find(sItem => sItem.id === invItem.id);
                    if (!shopItem) return null;
                    
                    return (
                      <div key={invItem.id} className="flex items-center gap-4 rounded-md border border-border/20 bg-muted/10 p-3">
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <Image 
                            src={shopItem.imageUrl} 
                            alt={shopItem.name} 
                            fill
                            className="rounded-md object-cover"
                            data-ai-hint={shopItem.aiHint}
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-foreground">{shopItem.name} {invItem.quantity > 1 && `(x${invItem.quantity})`}</h4>
                          <p className="text-xs text-muted-foreground">{shopItem.description}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleUseItem(invItem.id)}>
                          Kullan
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Envanterin boş.</p>
                </div>
              )}
            </div>
          </div>
        </FuturisticBorder>
      </DialogContent>
    </Dialog>
  );
}
