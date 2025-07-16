
'use server';

import { createNewUser, getUserForLogin } from '@/lib/userData';
import type { User } from '@/types';

export async function registerUserAction(credentials: { username: string, password?: string }): Promise<{ success: boolean; message: string; }> {
    try {
        const result = await createNewUser(credentials.username, credentials.password);
        return result;
    } catch (error) {
        console.error("Registration error in server action:", error);
        const errorMessage = error instanceof Error ? error.message : 'Kayıt sırasında sunucuda beklenmedik bir hata oluştu.';
        return { success: false, message: errorMessage };
    }
}

export async function loginUserAction(credentials: { username: string, password?: string }): Promise<{ success: boolean; message: string; user?: User; }> {
    try {
        const result = await getUserForLogin(credentials.username, credentials.password);
        return result;
    } catch (error) {
        console.error("Login error in server action:", error);
        const errorMessage = error instanceof Error ? error.message : 'Giriş sırasında sunucuda beklenmedik bir hata oluştu.';
        return { success: false, message: errorMessage };
    }
}
