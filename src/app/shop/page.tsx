
'use client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { FuturisticBorder } from '@/components/futuristic-border';
import { ShopItem } from './_components/shop-item';
import { Coins } from 'lucide-react';

import './shop.css';

const shopItemsData = [
  {
    id: 'potion_energy',
    name: 'Mana İksiri',
    description: 'Tükenmiş enerjiyi anında yeniler. Zihinsel ve fiziksel gücü tazelemek için hızlı bir çözüm.',
    price: 100,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'glowing potion'
  },
  {
    id: 'scroll_cinema',
    name: 'Gölge Sineması',
    description: 'Zihni dinlendirmek ve farklı dünyalara kaçmak için 20 dakikalık görsel bir deneyim sunar.',
    price: 120,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'futuristic screen'
  },
  {
    id: 'tome_psychology',
    name: 'Zihin Güçlendirme Parşömeni',
    description: '25 dakikalık yoğun odaklanma ile zihinsel dayanıklılığı ve anlayışı artırır. Psikolojik engelleri aşmaya yardımcı olur.',
    price: 150,
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'magic scroll'
  },
  {
    id: 'book_wisdom',
    name: 'Bilgelik Tomarı',
    description: '25 dakika boyunca kadim bilgileri özümseyerek entelektüel kapasiteyi ve algıyı yükseltir.',
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

  const handlePurchase = (price: number) => {
    const newGold = gold - price;
    setGold(newGold);
    localStorage.setItem('userGold', JSON.stringify(newGold));
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
