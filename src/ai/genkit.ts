import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: 'AIzaSyDeJgbB8s07f_qpc6aiwc8IN9QWXDlVzzE'})],
  model: 'googleai/gemini-2.0-flash',
});
