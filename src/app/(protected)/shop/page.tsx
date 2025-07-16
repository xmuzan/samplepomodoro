
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUserData } from '@/lib/userData';
import type { User } from '@/types';
import { ShopManager } from './_components/shop-manager';
import { shopItemsData } from './shop-data';

import './shop.css';


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
            shopItems={shopItemsData}
        />
    )
}
