
'use server';

import { cookies } from 'next/headers';
import { getUserForLogin } from '@/lib/userData';
import type { User } from '@/types';

export async function loginUserAction(credentials: { username?: string, password?: string }): Promise<{ success: boolean, message: string }> {
    if (!credentials.username || !credentials.password) {
        return { success: false, message: 'Kullanıcı adı ve şifre gereklidir.' };
    }

    const result = await getUserForLogin(credentials.username, credentials.password);

    if (result.success && result.user) {
        if (result.user.status === 'pending') {
            return { success: false, message: 'Hesabınız yönetici onayı bekliyor.' };
        }
        
        const session = {
            user: result.user,
            expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };

        // Set the cookie on the server
        cookies().set('currentUser', JSON.stringify(session), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return { success: true, message: 'Giriş başarılı.' };
    }

    return { success: false, message: result.message };
}

export async function logoutAction() {
    cookies().delete('currentUser');
}
