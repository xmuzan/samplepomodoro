
'use server';

import { suggestTaskName } from '@/ai/flows/suggest-task-name';

export async function suggestTaskAction(): Promise<{ success: boolean; taskName?: string; error?: string; }> {
    try {
        const result = await suggestTaskName({ prompt: 'Hayatında seviye atlamak isteyen modern bir savaşçı için zorlu, uygulanabilir ve ilham verici bir görev öner.' });
        if (result.taskName) {
             return { success: true, taskName: result.taskName };
        }
        return { success: false, error: 'AI bir görev adı oluşturamadı.' };
    } catch (error) {
        console.error('Görev adı önerilirken hata oluştu:', error);
        return { success: false, error: 'AI önerisiyle ilgili beklenmedik bir hata oluştu.' };
    }
}
