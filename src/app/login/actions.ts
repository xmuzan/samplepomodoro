
'use server';

import { z } from 'zod';
import { createNewUser, getUserForLogin } from '@/lib/userData';
import type { User } from '@/types';

const credentialsSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
  password: z.string().min(1, "Şifre gereklidir."),
});

export async function registerUserAction(credentials: z.infer<typeof credentialsSchema>): Promise<{ success: boolean; message: string; }> {
    try {
        const validatedCredentials = credentialsSchema.parse(credentials);
        const result = await createNewUser(validatedCredentials.username, validatedCredentials.password);
        return result;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, message: error.errors[0].message };
        }
        console.error('Registration action error:', error);
        return { success: false, message: 'Sunucuda beklenmedik bir hata oluştu.' };
    }
}

export async function loginUserAction(credentials: z.infer<typeof credentialsSchema>): Promise<{ success: boolean; message: string; user?: User; }> {
     try {
        const validatedCredentials = credentialsSchema.parse(credentials);
        const result = await getUserForLogin(validatedCredentials.username, validatedCredentials.password);
        return result;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, message: error.errors[0].message };
        }
        console.error('Login action error:', error);
        return { success: false, message: 'Sunucuda beklenmedik bir hata oluştu.' };
    }
}
