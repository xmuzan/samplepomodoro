
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
  prompt: z.string().describe('Görev adı oluşturmak için bir istem.'),
});
export type SuggestTaskNameInput = z.infer<typeof SuggestTaskNameInputSchema>;

const SuggestTaskNameOutputSchema = z.object({
  taskName: z.string().describe('Önerilen görev adı.'),
});
export type SuggestTaskNameOutput = z.infer<typeof SuggestTaskNameOutputSchema>;

export async function suggestTaskName(input: SuggestTaskNameInput): Promise<SuggestTaskNameOutput> {
  return suggestTaskNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskNamePrompt',
  input: {schema: SuggestTaskNameInputSchema},
  output: {schema: SuggestTaskNameOutputSchema},
  prompt: `Aşağıdaki isteğe göre Türkçe bir görev adı öner: {{{prompt}}}`,
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
