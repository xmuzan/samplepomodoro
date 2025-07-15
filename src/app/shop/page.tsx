
'use client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { FuturisticBorder } from '@/components/futuristic-border';
import { ShopItem, type ShopItemData } from './_components/shop-item';
import { Coins } from 'lucide-react';

import './shop.css';

export const shopItemsData: ShopItemData[] = [
  {
    id: 'potion_energy',
    name: 'Mana İksiri',
    description: 'Envanterden kullanarak bir bardak içecek veya bir paket atıştırmalık tüket. Anında %10 HP yeniler.',
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
    price: 120,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'futuristic screen'
  },
  {
    id: 'tome_psychology',
    name: 'Zihin Güçlendirme Parşömeni',
    description: 'Envanterden kullanarak 25 dakika boyunca psikoloji hakkında bir video izle veya makale oku. Zihinsel dayanıklılığını artırır.',
    price: 150,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'magic scroll'
  },
  {
    id: 'book_wisdom',
    name: 'Bilgelik Tomarı',
    description: 'Envanterden kullanarak 25 dakika boyunca kendini geliştirecek bir kitap oku. Entelektüel kapasiteni ve algını yükseltir.',
    price: 200,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'ancient book'
  },
];


export default function ShopPage() {
  const [gold, setGold] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedGold = localStorage.getItem('userGold');
      setGold(storedGold ? JSON.parse(storedGold) : 0);
    } catch (error) {
      console.error("Failed to parse gold from localStorage", error);
      setGold(0);
    }
  }, []);
  
  useEffect(() => {
    if (isMounted) {
      const handleStorageChange = () => {
        const storedGold = localStorage.getItem('userGold');
        if (storedGold) {
            setGold(JSON.parse(storedGold));
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isMounted]);

  const handlePurchase = (item: ShopItemData) => {
    const newGold = gold - item.price;
    setGold(newGold);
    localStorage.setItem('userGold', JSON.stringify(newGold));
    
    // Add to inventory
    try {
      const currentInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      const itemInInventory = currentInventory.find((invItem: {id: string}) => invItem.id === item.id);

      if (itemInInventory) {
        itemInInventory.quantity += 1;
      } else {
        currentInventory.push({ id: item.id, quantity: 1 });
      }
      localStorage.setItem('inventory', JSON.stringify(currentInventory));
    } catch(error) {
      console.error("Failed to update inventory in localStorage", error);
    }

    window.dispatchEvent(new Event('storage'));
  };

  if (!isMounted) {
    return (
        <div className="flex min-h-screen flex-col bg-transparent text-foreground md:flex-row">
            <Navbar />
            <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
                {/* Skeleton loader can be added here */}
            </main>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-foreground md:flex-row">
      <Navbar />
      <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <FuturisticBorder>
            <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6">
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
            </div>
          </FuturisticBorder>
        </div>
      </main>
    </div>
  );
}
