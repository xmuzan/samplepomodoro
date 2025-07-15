
'use server';

import { suggestTaskName } from '@/ai/flows/suggest-task-name';

export async function suggestTaskAction(): Promise<{ success: boolean; taskName?: string; error?: string; }> {
    try {
        const result = await suggestTaskName({ prompt: 'Suggest a challenging quest for a modern-day warrior seeking to level up their life. The quest should be short, actionable, and inspiring.' });
        if (result.taskName) {
             return { success: true, taskName: result.taskName };
        }
        return { success: false, error: 'AI could not generate a task name.' };
    } catch (error) {
        console.error('Error suggesting task name:', error);
        return { success: false, error: 'An unexpected error occurred with the AI suggestion.' };
    }
}
