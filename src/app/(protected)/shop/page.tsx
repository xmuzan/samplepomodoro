
'use client';
import { useState, useEffect, useCallback } from 'react';
import { FuturisticBorder } from '@/components/futuristic-border';
import { ShopItem, type ShopItemData } from './_components/shop-item';
import { Coins, Lock } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getUserData, updateUserData } from '@/lib/userData';
import type { InventoryItem } from '../profile/_components/inventory-dialog';

import './shop.css';

export const shopItemsData: ShopItemData[] = [
  {
    id: 'potion_energy',
    name: 'Enerji İksiri',
    description: 'Envanterden kullanarak anında %10 HP yeniler.',
    price: 100,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'glowing potion'
  },
  {
    id: 'potion_mind',
    name: 'Zihin Kristali',
    description: 'Envanterden kullanarak zihinsel berraklığı anında artır. %15 MP yeniler.',
    price: 120,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'glowing blue crystal'
  },
  {
    id: 'scroll_cinema',
    name: 'Gölge Sineması',
    description: 'Envanterden kullanarak 20 dakikalık bir film, dizi veya video izle. Zihnini dinlendirir ve farklı dünyalara kaçmanı sağlar.',
    price: 250,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'futuristic screen'
  },
  {
    id: 'tome_psychology',
    name: 'Zihin Güçlendirme Parşömeni',
    description: 'Envanterden kullanarak 25 dakika boyunca psikoloji hakkında bir video izle veya makale oku. Zihinsel dayanıklılığını artırır.',
    price: 250,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'magic scroll'
  },
  {
    id: 'book_wisdom',
    name: 'Bilgelik Tomarı',
    description: 'Envanterden kullanarak 25 dakika boyunca kendini geliştirecek bir kitap oku. Entelektüel kapasiteni ve algını yükseltir.',
    price: 300,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'ancient book'
  },
];


function PenaltyTimer({ endTime }: { endTime: number }) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    if (endTime <= Date.now()) {
      setTimeLeft(0);
      return;
    }
    
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

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


export default function ShopPage() {
  const [gold, setGold] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [penaltyEndTime, setPenaltyEndTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = getCurrentUser();

  const loadData = useCallback(async () => {
    if (!currentUser) {
        setIsLoading(false);
        return;
    }
    try {
        const data = await getUserData(currentUser.username);
        setGold(data?.userGold || 0);
        
        const endTime = data?.penaltyEndTime || null;
        if (endTime && endTime > Date.now()) {
            setPenaltyEndTime(endTime);
        } else {
            setPenaltyEndTime(null);
        }
    } catch (error) {
        console.error("Failed to load user data from Firestore", error);
        setGold(0);
        setPenaltyEndTime(null);
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    if (isMounted) {
      const handleStorageChange = () => {
        loadData();
      };

      window.addEventListener('storage', handleStorageChange);
      const interval = setInterval(loadData, 5000); // Periodically check for penalty changes
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [isMounted, loadData]);

  const handlePurchase = async (item: ShopItemData) => {
    if (!currentUser || (penaltyEndTime && penaltyEndTime > Date.now()) || gold < item.price) return;
    
    try {
      const userData = await getUserData(currentUser.username);
      const currentInventory: InventoryItem[] = userData?.inventory || [];
      const newGold = gold - item.price;

      const itemInInventory = currentInventory.find((invItem) => invItem.id === item.id);

      if (itemInInventory) {
        itemInInventory.quantity += 1;
      } else {
        currentInventory.push({ id: item.id, quantity: 1 });
      }
      
      await updateUserData(currentUser.username, {
          userGold: newGold,
          inventory: currentInventory
      });
      
      setGold(newGold);
      window.dispatchEvent(new Event('storage'));

    } catch(error) {
      console.error("Failed to update inventory in Firestore", error);
    }
  };

  if (!isMounted || isLoading) {
    return (
        <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
            <p>Yükleniyor...</p>
        </main>
    );
  }

  const isPenaltyActive = penaltyEndTime && penaltyEndTime > Date.now();

  return (
    <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
      <div className="max-w-7xl mx-auto">
        <FuturisticBorder>
          <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6 min-h-[60vh]">
            {isPenaltyActive ? (
              <PenaltyTimer endTime={penaltyEndTime} />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-headline tracking-widest text-primary uppercase text-glow">
                    Mağaza
                  </h1>
                  <div className="flex items-center gap-2 text-lg font-mono p-2 rounded-md bg-muted/20">
                    <Coins className="h-6 w-6 text-yellow-400 text-glow" />
                    <span className="font-bold text-yellow-200">{new Intl.NumberFormat().format(gold)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {shopItemsData.map((item) => (
                    <ShopItem 
                      key={item.id}
                      item={item}
                      currentGold={gold}
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
