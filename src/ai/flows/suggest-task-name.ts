'use server';

/**
 * @fileOverview An AI agent for suggesting task names based on a prompt.
 *
 * - suggestTaskName - A function that suggests a task name using AI.
 * - SuggestTaskNameInput - The input type for the suggestTaskName function.
 * - SuggestTaskNameOutput - The return type for the suggestTaskName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskNameInputSchema = z.object({
  prompt: z.string().describe('A prompt to generate a task name from.'),
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
  prompt: `Suggest a task name based on the following prompt: {{{prompt}}}`,
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
