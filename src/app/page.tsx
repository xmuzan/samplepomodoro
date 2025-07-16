
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        if (getCurrentUser()) {
            router.replace('/tasks');
        } else {
            router.replace('/login');
        }
    }, [router]);

    return null; // or a loading spinner
}
