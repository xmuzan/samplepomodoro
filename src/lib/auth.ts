
'use client';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import { logoutAction } from '@/app/login/actions';
import type { User } from '@/types';

const USER_KEY = 'currentUser';

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

    const cookieValue = getCookie(USER_KEY);
    
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
