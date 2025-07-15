
'use server';

/**
 * @fileOverview Bir isteme dayalı olarak görev adları öneren bir yapay zeka ajanı.
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
  prompt: `You are an AI assistant for a "Solo Leveling" inspired life RPG app.
Your task is to generate a single, challenging, and inspiring quest name in Turkish based on the user's goal.
The quest name MUST be for a REAL-WORLD, ACHIEVABLE task. The NAME should be epic and inspired by fantasy, but the TASK itself must be grounded in reality.
DO NOT suggest anything that cannot be done in the real world, like "wear armor" or "slay a dragon".

Here are some good examples:
- User's goal: "go to the gym" -> Quest name: "Demir Kaleyi Fethet"
- User's goal: "read a book" -> Quest name: "Bilgelik Parşömenini Çöz"
- User's goal: "run 5 kilometers" -> Quest name: "Gölge Adımlarıyla Mesafeleri Aş"
- User's goal: "learn a new skill for 30 minutes" -> Quest name: "Yetenek Avcısı"

The quest name should be short, punchy, and sound epic.

User's goal: {{{prompt}}}

Generate ONLY ONE realistic, real-world quest name based on the user's goal.`,
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
