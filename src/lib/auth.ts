
'use client';
import { getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types';

/**
 * Logs the user out by deleting the cookie
 * and then redirecting to the login page.
 */
export function logout() {
    deleteCookie('currentUser', { path: '/' });
    window.location.href = '/login';
}

/**
 * Gets the current user from the cookie.
 * This is a client-side function. For server-side, read the cookie directly from headers.
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
        // Check if the session is expired
        if (session.expiry && session.expiry < Date.now()) {
            return null;
        }
        return session.user;
    } catch (error) {
        console.error("Failed to parse user session from cookie", error);
        return null;
    }
}
