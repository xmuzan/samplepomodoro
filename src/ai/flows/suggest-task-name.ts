
'use server';

/**
 * @fileOverview Gerçek hayatta yapılabilecek bir görev öneren yapay zeka ajanı.
 *
 * - suggestTaskName - AI kullanarak bir görev adı öneren bir işlev.
 * - SuggestTaskNameInput - suggestTaskName işlevi için giriş türü.
 * - SuggestTaskNameOutput - suggestTaskName işlevi için dönüş türü.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskNameInputSchema = z.object({
  prompt: z.string().describe('The user prompt for which to generate a task name.'),
});
export type SuggestTaskNameInput = z.infer<typeof SuggestTaskNameInputSchema>;

const SuggestTaskNameOutputSchema = z.object({
  taskName: z.string().describe('The suggested task name.'),
});
export type SuggestTaskNameOutput = z.infer<typeof SuggestTaskNameOutputSchema>;

export async function suggestTaskName(input: SuggestTaskNameInput): Promise<SuggestTaskNameOutput> {
  return suggestTaskNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskNamePrompt',
  input: {schema: SuggestTaskNameInputSchema},
  output: {schema: SuggestTaskNameOutputSchema},
  prompt: `You are an AI assistant for a life RPG app.
Your task is to generate a SINGLE, REAL-WORLD, ACHIEVABLE task in Turkish.
The task MUST be a concrete action a person can do in real life.

DO NOT suggest anything that cannot be done in the real world.
DO NOT use metaphorical or fantasy language for the task itself.

Here are some good examples of tasks you should suggest:
- "30 dakika kitap oku"
- "5 kilometre koş"
- "Odanı temizle"
- "Yeni bir yemek tarifi dene"
- "Bir saat boyunca dikkat dağılmadan ders çalış"
- "Markete gidip haftalık alışveriş yap"

The user's general goal is: {{{prompt}}}

Generate ONLY ONE realistic, real-world task name in Turkish based on the user's goal.
The output MUST BE a direct, actionable task.
For example, if the user's goal is "be productive", a good suggestion is "25 dakika boyunca Pomodoro tekniğiyle çalış".
A bad suggestion is "Awaken the eternal wisdom".
Just suggest the task.`,
});

const suggestTaskNameFlow = ai.defineFlow(
  {
    name: 'suggestTaskNameFlow',
    inputSchema: SuggestTaskNameInputSchema,
    outputSchema: SuggestTaskNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
