
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FuturisticBorder } from '@/components/futuristic-border';
import { ShopItem, type ShopItemData } from './shop-item';
import { Coins, Lock } from 'lucide-react';
import { getUserData, updateUserData } from '@/lib/userData';
import type { InventoryItem } from '../../profile/_components/inventory-dialog';
import { useToast } from '@/hooks/use-toast';

function PenaltyTimer({ endTime }: { endTime: number }) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());
  const router = useRouter();

  useEffect(() => {
    if (endTime <= Date.now()) {
      setTimeLeft(0);
      router.refresh();
      return;
    }
    
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        router.refresh();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, router]);

  if (timeLeft <= 0) {
    return null;
  }

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-destructive p-8">
      <Lock className="h-16 w-16 mb-4" />
      <h2 className="text-2xl font-bold mb-2">MAĞAZA KİLİTLİ</h2>
      <p className="text-muted-foreground mb-4">Ceza görevi nedeniyle mağazaya erişemezsin.</p>
      <p className="font-mono text-xl font-medium tracking-wider">
        KALAN SÜRE: {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
    </div>
  );
}


interface ShopManagerProps {
    username: string;
    initialGold: number;
    initialPenaltyEndTime: number | null;
    shopItems: ShopItemData[];
}

export function ShopManager({ username, initialGold, initialPenaltyEndTime, shopItems }: ShopManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handlePurchase = async (item: ShopItemData) => {
    if (!username || (initialPenaltyEndTime && initialPenaltyEndTime > Date.now()) || initialGold < item.price) return;
    
    try {
      const userData = await getUserData(username);
      const currentInventory: InventoryItem[] = userData?.inventory || [];
      const newGold = initialGold - item.price;

      const itemInInventory = currentInventory.find((invItem) => invItem.id === item.id);

      if (itemInInventory) {
        itemInInventory.quantity += 1;
      } else {
        currentInventory.push({ id: item.id, quantity: 1 });
      }
      
      await updateUserData(username, {
          userGold: newGold,
          inventory: currentInventory
      });
      
      toast({
        title: "Satın Alındı!",
        description: `${item.name} envanterine eklendi.`,
      });
      router.refresh(); // Refresh all server components
      
    } catch(error) {
      console.error("Failed to update inventory in Firestore", error);
      toast({
        title: "Hata",
        description: "Eşya satın alınırken bir sorun oluştu.",
        variant: "destructive",
      });
    }
  };

  const isPenaltyActive = initialPenaltyEndTime && initialPenaltyEndTime > Date.now();

  return (
    <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
      <div className="max-w-7xl mx-auto">
        <FuturisticBorder>
          <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6 min-h-[60vh]">
            {isPenaltyActive ? (
              <PenaltyTimer endTime={initialPenaltyEndTime} />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-headline tracking-widest text-primary uppercase text-glow">
                    Mağaza
                  </h1>
                  <div className="flex items-center gap-2 text-lg font-mono p-2 rounded-md bg-muted/20">
                    <Coins className="h-6 w-6 text-yellow-400 text-glow" />
                    <span className="font-bold text-yellow-200">{new Intl.NumberFormat().format(initialGold)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {shopItems.map((item) => (
                    <ShopItem 
                      key={item.id}
                      item={item}
                      currentGold={initialGold}
                      onPurchase={handlePurchase}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </FuturisticBorder>
      </div>
    </main>
  );
}
