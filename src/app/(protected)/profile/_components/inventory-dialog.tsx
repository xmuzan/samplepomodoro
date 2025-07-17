
'use client';

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { updateUserData, type UserData } from "@/lib/userData";
import { getCurrentUser } from "@/lib/auth";
import { shopItemsData } from "../../shop/shop-data";
import { useRouter } from "next/navigation";
import type { InventoryItem } from "@/lib/userData";

interface InventoryDialogProps {
  children: React.ReactNode;
  initialInventory: InventoryItem[];
  userData: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryDialog({ children, initialInventory, userData, open, onOpenChange }: InventoryDialogProps) {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const router = useRouter();

  const handleDeleteItem = async (itemId: string) => {
    if (!currentUser || !userData) {
      toast({ title: "Hata", description: "İşlem için kullanıcı verisi bulunamadı.", variant: "destructive" });
      return;
    }

    try {
      let updatedInventory = [...initialInventory];
      const itemIndex = updatedInventory.findIndex(item => item.id === itemId);

      if (itemIndex > -1) {
        updatedInventory[itemIndex].quantity -= 1;
        if (updatedInventory[itemIndex].quantity <= 0) {
          updatedInventory = updatedInventory.filter((_, index) => index !== itemIndex);
        }

        await updateUserData(currentUser.username, {
          inventory: updatedInventory,
        });

        toast({ title: "Başarılı", description: "Eşya envanterden silindi." });
        
        if (updatedInventory.length === 0) {
          onOpenChange(false);
        }
        
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete item", error);
      toast({ title: "Hata", description: "Eşya silinirken bir sorun oluştu.", variant: "destructive" });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                          <p className="text-xs text-muted-foreground">{shopItem.description}</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(invItem.id)}>
                          Sil
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
