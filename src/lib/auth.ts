
'use client';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types';

const USER_KEY = 'currentUser';

/**
 * Saves the user object to a cookie to start a session.
 */
export function login(user: User) {
    const session = {
        user: user,
        expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    setCookie(USER_KEY, JSON.stringify(session), {
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    });
    // For components that still use localStorage, we can keep it for now.
    localStorage.setItem(USER_KEY, JSON.stringify(session));
}


export function logout() {
    deleteCookie(USER_KEY, { path: '/' });
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login'; // Force a full page reload to clear state
}

export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
        return null;
    }

    // Prefer cookie, fallback to localStorage for components that haven't been updated
    const cookieValue = getCookie(USER_KEY);
    const sessionStr = typeof cookieValue === 'string' ? cookieValue : localStorage.getItem(USER_KEY);
    
    if (!sessionStr) {
        return null;
    }

    try {
        const session = JSON.parse(sessionStr);
        if (session.expiry < Date.now()) {
            // Synchronous logout without forcing full reload here to avoid issues in render
            deleteCookie(USER_KEY, { path: '/' });
            localStorage.removeItem(USER_KEY);
            return null;
        }
        return session.user;
    } catch (error) {
        console.error("Failed to parse user session", error);
        deleteCookie(USER_KEY, { path: '/' });
        localStorage.removeItem(USER_KEY);
        return null;
    }
}
