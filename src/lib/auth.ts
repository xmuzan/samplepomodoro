
'use client';

import type { User } from '@/types';

const USER_KEY = 'currentUser';

export function login(username: string, password?: string): { success: boolean, message: string, user?: User } {
    if (username === 'fatihbey' && password === '$fatihbey$') {
        const user: User = {
            username: 'fatihbey',
            isAdmin: true,
            status: 'active',
        };
        const session = {
            user,
            expiry: Date.now() + 60 * 60 * 1000, // 1 hour from now
        };
        localStorage.setItem(USER_KEY, JSON.stringify(session));
        return { success: true, message: 'Admin girişi başarılı!', user };
    }
    
    // For now, any other login is treated as a guest or a pending user
    // A more robust system would check a user database
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find((u: any) => u.username === username);

        if (existingUser) {
             if (existingUser.status === 'pending') {
                 return { success: false, message: 'Hesabınız yönetici onayı bekliyor.' };
             }
             const session = {
                user: existingUser,
                expiry: Date.now() + 60 * 60 * 1000, // 1 hour
             };
             localStorage.setItem(USER_KEY, JSON.stringify(session));
             return { success: true, message: 'Giriş başarılı!', user: existingUser };
        }
    } catch {}


    return { success: false, message: 'Geçersiz kullanıcı adı veya şifre.' };
}

export function register(username: string, password?: string): { success: boolean, message: string } {
    if (!username || !password) {
        return { success: false, message: 'Kullanıcı adı ve şifre gerekli.' };
    }
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find((u: any) => u.username === username);

        if (existingUser) {
            return { success: false, message: 'Bu kullanıcı adı zaten alınmış.' };
        }

        const newUser = {
            username,
            password, // Note: Storing plain text passwords is a security risk. This is for demo purposes.
            isAdmin: false,
            status: 'pending',
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        return { success: true, message: 'Kaydınız alındı. Hesabınız yönetici tarafından onaylandığında giriş yapabilirsiniz.' };

    } catch (error) {
        return { success: false, message: 'Kayıt sırasında bir hata oluştu.' };
    }
}


export function logout() {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('storage')); // Notify other tabs/components
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
