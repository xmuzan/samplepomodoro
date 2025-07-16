
'use client';
import { getCookie } from 'cookies-next';
import type { User } from '@/types';

/**
 * Gets the current user from the session cookie.
 * This is a client-side function.
 * @returns The user object or null if not authenticated.
 */
export function getCurrentUser(): User | null {
    // Make sure this code only runs in the browser
    if (typeof window === 'undefined') {
        return null;
    }

    const cookieValue = getCookie('currentUser');
    
    if (!cookieValue || typeof cookieValue !== 'string') {
        return null;
    }
    
    try {
        const session = JSON.parse(cookieValue);
        // Check if the session is expired
        if (session.expiry && session.expiry < Date.now()) {
            return null; // Session expired
        }
        return session.user;
    } catch (error) {
        console.error("Failed to parse user session from cookie", error);
        return null;
    }
}
