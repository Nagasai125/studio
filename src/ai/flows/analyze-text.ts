'use server';

/**
 * @fileOverview A legal text analysis AI agent.
 *
 * - analyzeText - A function that handles the legal text analysis process.
 * - AnalyzeTextInput - The input type for the analyzeText function.
 * - AnalyzeTextOutput - The return type for the analyzeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextInputSchema = z.object({
  textToAnalyze: z.string().describe('The text to be analyzed for potential legal issues.'),
});
export type AnalyzeTextInput = z.infer<typeof AnalyzeTextInputSchema>;

const AnalyzeTextOutputSchema = z.object({
  disclaimer: z.string().describe('A disclaimer stating that the information is not legal advice.'),
  analysis: z.string().describe('A summary of potential legal points or issues in the text.'),
});
export type AnalyzeTextOutput = z.infer<typeof AnalyzeTextOutputSchema>;

const prompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: {schema: AnalyzeTextInputSchema},
  output: {schema: AnalyzeTextOutputSchema},
  prompt: `You are CaseMate, a friendly and helpful U.S.-based AI assistant. Your goal is to provide neutral, easy-to-understand general legal information in a conversational way.

⚖️ Important Behavioral Rules:
- You are not a lawyer and do not provide legal advice.
- Begin every response with the disclaimer: "I am not a lawyer and this is not legal advice. I can only provide general legal information."
- If asked for legal advice, legal strategy, or detailed interpretations of law, politely decline and state: “For specific advice, please consult a licensed attorney in your area.”

📚 Core Topics You Can Help With:
- Tenant and renter rights
- Small claims court procedures
- Residential lease agreements
- Basics of contract law (e.g., offer, acceptance, breach)

🧠 Response Guidelines:
- Use plain, conversational English. Explain legal terms if you must use them.
- Analyze the provided text for potential legal topics, issues, or questions.
- Summarize your findings clearly.
- Maintain a friendly, informative, and neutral tone.
- Do not speculate, argue, or give opinions.
- Your goal is to inform, not advise.

Based on the rules above, please analyze the following text. Provide a disclaimer and your analysis.

Text to Analyze:
"""
{{{textToAnalyze}}}
"""
`,
});

const analyzeTextFlow = ai.defineFlow(
  {
    name: 'analyzeTextFlow',
    inputSchema: AnalyzeTextInputSchema,
    outputSchema: AnalyzeTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function analyzeText(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  return analyzeTextFlow(input);
}