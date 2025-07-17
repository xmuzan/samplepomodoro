
'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { getUserData, updateUserData } from "@/lib/userData";
import { getCurrentUser } from "@/lib/auth";
import { shopItemsData } from "../../shop/shop-data";

export interface InventoryItem {
  id: string;
  quantity: number;
}

interface InventoryDialogProps {
  children: React.ReactNode;
  initialInventory: InventoryItem[];
}

export function InventoryDialog({ children, initialInventory }: InventoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const router = useRouter();
  
  const handleUseItem = async (itemId: string) => {
    if (!currentUser) return;
    const itemData = shopItemsData.find(item => item.id === itemId);
    if (!itemData) return;
    
    try {
        const userData = await getUserData(currentUser.username);
        if (!userData || !userData.baseStats || !userData.inventory) {
          toast({ title: "Hata", description: "Kullanıcı verisi bulunamadı.", variant: "destructive" });
          return;
        }

        let newStats = { ...userData.baseStats };
        let itemUsed = false;
        
        // Handle direct-use items like potions
        switch(itemId) {
          case 'potion_energy':
            if (newStats.hp >= 100) {
              toast({ title: "HP Zaten Dolu", description: "Enerji iksiri kullanamazsın." });
              return; // Do not proceed if HP is full
            }
            newStats.hp = Math.min(100, newStats.hp + 10);
            toast({ title: "Enerji Yenilendi", description: "HP 10 puan yenilendi." });
            itemUsed = true;
            break;
          case 'potion_mind':
            if (newStats.mp >= 100) {
              toast({ title: "MP Zaten Dolu", description: "Zihin kristali kullanamazsın." });
              return; // Do not proceed if MP is full
            }
            newStats.mp = Math.min(100, newStats.mp + 15);
            toast({ title: "Zihin Canlandı", description: "MP 15 puan yenilendi." });
            itemUsed = true;
            break;
          default:
             // Handle items that are not directly used from inventory
             toast({ title: itemData.name, description: "Bu eşya bir eylemi tamamlamak için kullanılır." });
             return; // Don't consume the item
        }
        
        if (!itemUsed) return; // If no item was actually used, stop here.

        // Find the item in inventory and reduce its quantity
        const itemIndex = userData.inventory.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
          toast({ title: "Hata", description: "Eşya envanterinde bulunamadı.", variant: "destructive" });
          return;
        };

        const updatedInventory = [...userData.inventory];
        if (updatedInventory[itemIndex].quantity > 1) {
          updatedInventory[itemIndex].quantity -= 1;
        } else {
          // Remove the item if quantity is 1
          updatedInventory.splice(itemIndex, 1);
        }
            
        await updateUserData(currentUser.username, {
            inventory: updatedInventory,
            baseStats: newStats
        });
        
        toast({ title: "Başarılı", description: `${itemData.name} kullanıldı.` });
        router.refresh(); 
        setOpen(false); // Close the dialog after using an item

    } catch (error) {
        console.error("Failed to use item", error);
        toast({ title: "Hata", description: "Eşya kullanılırken bir sorun oluştu.", variant: "destructive" });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              {initialInventory && initialInventory.length > 0 ? (
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
