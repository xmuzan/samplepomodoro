
'use client';

import type { User } from '@/types';

const USER_KEY = 'currentUser';

/**
 * Saves the user object to localStorage to start a session.
 * This should be called after a successful login from a Server Action.
 */
export function login(user: User) {
    const session = {
        user: user,
        expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    localStorage.setItem(USER_KEY, JSON.stringify(session));
}


export function logout() {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('storage'));
}

export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const sessionStr = localStorage.getItem(USER_KEY);
    if (!sessionStr) {
        return null;
    }

    try {
        const session = JSON.parse(sessionStr);
        if (session.expiry < Date.now()) {
            logout();
            return null;
        }
        return session.user;
    } catch (error) {
        console.error("Failed to parse user session", error);
        logout();
        return null;
    }
}
