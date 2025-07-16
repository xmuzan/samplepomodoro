
'use server';

import { z } from 'zod';
import { getUserForLogin } from '@/lib/userData';
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
        // We call our API route instead of directly calling the database function
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            // Forward the error message from the API route
            return { success: false, message: result.message || 'Kayıt sırasında bir hata oluştu.' };
        }

        return result;

    } catch (error) {
        console.error("Registration action error:", error);
        // This will catch network errors between server action and API route
        return { success: false, message: 'Kayıt sırasında beklenmedik bir hata oluştu.' };
    }
}

export async function loginUserAction(credentials: unknown): Promise<AuthResult> {
    const validated = AuthSchema.safeParse(credentials);
    if (!validated.success) {
        // Allow login attempt even if validation fails, backend will check.
        // This is to avoid giving away which fields are incorrect.
    }

    const { username, password } = credentials as z.infer<typeof AuthSchema>;

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
