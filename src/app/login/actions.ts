
'use server';

import { z } from 'zod';
import { createNewUser, getUserForLogin } from '@/lib/userData';
import type { User } from '@/types';

const AuthSchema = z.object({
    username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
});

type AuthResult = {
    success: boolean;
    message: string;
    user?: User;
}

export async function registerUserAction(credentials: unknown): Promise<Omit<AuthResult, 'user'>> {
    const validated = AuthSchema.safeParse(credentials);
    if (!validated.success) {
        return { success: false, message: validated.error.errors[0].message };
    }
    
    const { username, password } = validated.data;

    try {
        const result = await createNewUser(username, password);
        return result;
    } catch (error) {
        console.error("Registration action error:", error);
        return { success: false, message: 'Kayıt sırasında sunucuda beklenmedik bir hata oluştu.' };
    }
}

export async function loginUserAction(credentials: unknown): Promise<AuthResult> {
    const validated = AuthSchema.safeParse(credentials);
    if (!validated.success) {
        return { success: false, message: "Geçersiz kullanıcı adı veya şifre." };
    }

    const { username, password } = validated.data;

    try {
        const result = await getUserForLogin(username, password);
        if (result.success && result.user) {
            if (result.user.status === 'pending') {
                return { success: false, message: 'Hesabınız yönetici onayı bekliyor.' };
            }
            return { success: true, message: 'Giriş başarılı!', user: result.user };
        } else {
            return { success: false, message: result.message || 'Geçersiz kullanıcı adı veya şifre.' };
        }
    } catch (error) {
        console.error("Login action error:", error);
        return { success: false, message: 'Giriş sırasında bir hata oluştu.' };
    }
}
