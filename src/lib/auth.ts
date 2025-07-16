
'use client';
import { getCookie } from 'cookies-next';
import { logoutAction } from '@/app/login/actions';
import type { User } from '@/types';

/**
 * Logs the user out by calling the server action to delete the cookie
 * and then forces a page reload to clear all state.
 */
export async function logout() {
    await logoutAction();
    // Use window.location to force a full refresh and clear all client state
    window.location.href = '/login';
}

/**
 * Gets the current user from the cookie.
 * This is a client-side function. For server-side, read the cookie directly.
 */
export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const cookieValue = getCookie('currentUser');
    
    if (!cookieValue || typeof cookieValue !== 'string') {
        return null;
    }

    try {
        const session = JSON.parse(cookieValue);
        if (session.expiry < Date.now()) {
            return null;
        }
        return session.user;
    } catch (error) {
        console.error("Failed to parse user session", error);
        return null;
    }
}
