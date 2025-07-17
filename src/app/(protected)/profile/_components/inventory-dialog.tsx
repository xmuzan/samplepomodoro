
'use client';

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FuturisticBorder } from "@/components/futuristic-border";
import { useToast } from "@/hooks/use-toast";
import { updateUserData, type UserData } from "@/lib/userData";
import { getCurrentUser } from "@/lib/auth";
import { shopItemsData } from "../../shop/shop-data";
import { useRouter } from "next/navigation";
import type { InventoryItem } from "@/lib/userData";
import type { UserStats } from "@/lib/stats";

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialInventory: InventoryItem[];
  userData: UserData | null;
}

export function InventoryDialog({ open, onOpenChange, initialInventory, userData }: InventoryDialogProps) {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const router = useRouter();

  const handleUseItem = async (itemId: string) => {
    if (!currentUser || !userData || !userData.baseStats || !initialInventory) {
        toast({ title: "Hata", description: "Kullanıcı verisi bulunamadı.", variant: "destructive" });
        return;
    }
    const itemData = shopItemsData.find(item => item.id === itemId);
    if (!itemData) return;

    try {
        let newStats: UserStats = { ...userData.baseStats };
        let itemConsumed = false;

        switch(itemId) {
          case 'potion_energy':
            newStats.hp = Math.min(100, newStats.hp + 10);
            toast({ title: "Enerji Yenilendi", description: "HP %10 yenilendi." });
            itemConsumed = true;
            break;
          case 'potion_mind':
            newStats.mp = Math.min(100, newStats.mp + 15);
            toast({ title: "Zihin Canlandı", description: "MP %15 yenilendi." });
            itemConsumed = true;
            break;
          default:
             toast({ title: itemData.name, description: "Bu eşyanın doğrudan bir kullanım etkisi yok." });
             return; 
        }
        
        if (!itemConsumed) return;

        let updatedInventory = [...initialInventory];
        const itemIndex = updatedInventory.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            updatedInventory[itemIndex].quantity -= 1;
            if (updatedInventory[itemIndex].quantity <= 0) {
                updatedInventory = updatedInventory.filter((_, index) => index !== itemIndex);
            }
            
            await updateUserData(currentUser.username, {
                inventory: updatedInventory,
                baseStats: newStats
            });
            
            if (updatedInventory.length === 0) {
              onOpenChange(false);
            }
            
            router.refresh();
        }
    } catch (error) {
        console.error("Failed to use item", error);
        toast({ title: "Hata", description: "Eşya kullanılırken bir sorun oluştu.", variant: "destructive" });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              {initialInventory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {initialInventory.map(invItem => {
                    const shopItem = shopItemsData.find(sItem => sItem.id === invItem.id);
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
