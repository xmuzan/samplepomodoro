
'use server';

import { redirect } from 'next/navigation';
import { FuturisticBorder } from '@/components/futuristic-border';
import { ShopItem, type ShopItemData } from './_components/shop-item';
import { Coins, Lock } from 'lucide-react';
import { cookies } from 'next/headers';
import { getUserData } from '@/lib/userData';
import type { User } from '@/types';
import { ShopManager } from './_components/shop-manager';

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


function getCurrentUser(): User | null {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('currentUser');
    if (!sessionCookie?.value) return null;

    try {
        const session = JSON.parse(sessionCookie.value);
        if (session.expiry && session.expiry > Date.now()) {
            return session.user;
        }
    } catch (e) {
        return null;
    }
    return null;
}


export default async function ShopPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        redirect('/login');
    }

    const userData = await getUserData(currentUser.username);
    const gold = userData?.userGold || 0;
    const penaltyEndTime = userData?.penaltyEndTime || null;
    
    return (
        <ShopManager 
            username={currentUser.username}
            initialGold={gold}
            initialPenaltyEndTime={penaltyEndTime}
        />
    )
}
