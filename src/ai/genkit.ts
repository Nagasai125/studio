import {genkit} from 'genkit';
import groq, { llama33x70bVersatile } from 'genkitx-groq';

export const ai = genkit({
  plugins: [groq()],
  model: llama33x70bVersatile,
});
