
'use client';

import type { User } from '@/types';
import { getUserForLogin, createNewUser } from './userData';

const USER_KEY = 'currentUser';

export async function login(username: string, password?: string): Promise<{ success: boolean, message: string, user?: User }> {
    try {
        const result = await getUserForLogin(username, password);
        if (result.success && result.user) {
            if (result.user.status === 'pending') {
                return { success: false, message: 'Hesabınız yönetici onayı bekliyor.' };
            }
            const session = {
                user: result.user,
                expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            };
            localStorage.setItem(USER_KEY, JSON.stringify(session));
            return { success: true, message: 'Giriş başarılı!', user: result.user };
        } else {
            return { success: false, message: result.message || 'Geçersiz kullanıcı adı veya şifre.' };
        }
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: 'Giriş sırasında bir hata oluştu.' };
    }
}

export async function register(username: string, password?: string): Promise<{ success: boolean, message: string }> {
    if (!username || !password) {
        return { success: false, message: 'Kullanıcı adı ve şifre gerekli.' };
    }
    try {
        const result = await createNewUser(username, password);
        return result;
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: 'Kayıt sırasında bir hata oluştu.' };
    }
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
