'use client';

import { useState, useTransition } from "react";
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
import { type UserData } from "@/lib/userData";
import { shopItemsData } from "../../shop/shop-data";
import type { InventoryItem } from "@/lib/userData";
import { deleteItemAction } from '../actions';
import { useRouter } from "next/navigation";


interface InventoryDialogProps {
  initialInventory: InventoryItem[];
  userData: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function InventoryDialog({ initialInventory, userData, open, onOpenChange, children }: InventoryDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDeleteItem = (itemId: string) => {
    // We get the username directly from userData prop, which is more reliable.
    if (!userData?.username) {
        toast({ title: "Hata", description: "İşlem için kullanıcı verisi bulunamadı.", variant: "destructive" });
        return;
    }
    
    startTransition(async () => {
        const result = await deleteItemAction(userData.username, itemId);
        if (result.success) {
            toast({ title: "Eşya Kullanıldı", description: "Eşya başarıyla kullanıldı." });
            
            // If the last item was deleted, close the dialog
            if (initialInventory.length === 1 && initialInventory[0].quantity === 1) {
              onOpenChange(false);
            }
        } else {
            toast({ title: "Hata", description: result.message, variant: "destructive" });
        }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
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
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeleteItem(invItem.id)}
                          disabled={isPending}
                        >
                          {isPending ? "Kullanılıyor..." : "Kullan"}
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
