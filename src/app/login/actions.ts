
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

// This Server Action is now only used for the login page, as registration is handled on the client for testing.
export async function registerUserAction(credentials: unknown): Promise<Omit<AuthResult, 'user'>> {
   // This function is temporarily disabled for the client-side test.
   // In a real scenario, this would call createNewUser.
   console.error("registerUserAction is called, but registration is handled client-side for this test.");
   return { success: false, message: "Sunucu tarafı kayıt devre dışı." };
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
