
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserForLogin } from '@/lib/userData';

export async function loginUserAction(credentials: { username?: string, password?: string }): Promise<{ success: boolean, message?: string }> {
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

        // Redirect from the server action
        redirect('/tasks');

        // This part will not be reached due to the redirect, but it's good practice
        // return { success: true }; 
    }

    return { success: false, message: result.message };
}

export async function logoutAction() {
    cookies().delete('currentUser');
}
