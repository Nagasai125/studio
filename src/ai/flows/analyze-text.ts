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
  isSpam: z.boolean().describe('Whether the text is considered spam, irrelevant, or nonsensical.'),
  spamReason: z.string().optional().describe('The reason why the text is considered spam, along with tips to avoid it. Only present if isSpam is true.'),
  disclaimer: z.string().optional().describe('A disclaimer stating that the information is not legal advice. Only present if isSpam is false.'),
  analysis: z.string().optional().describe('A summary of potential legal points or issues in the text. Only present if isSpam is false.'),
});
export type AnalyzeTextOutput = z.infer<typeof AnalyzeTextOutputSchema>;

const prompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: {schema: AnalyzeTextInputSchema},
  output: {schema: AnalyzeTextOutputSchema},
  prompt: `You are CaseMate, a friendly and helpful U.S.-based AI assistant. Your task is a two-step process:

1.  **Spam Check:** First, determine if the user's text is spam, irrelevant, or nonsensical.
    *   If it is spam, set 'isSpam' to true and provide a brief reason in 'spamReason'. In a new paragraph, also provide a few brief, general tips on how to identify and avoid similar spam in the future. For example: "Here are a few tips to avoid this type of spam:..." Do not proceed with the legal analysis.
    *   If the text is legitimate, set 'isSpam' to false and continue to the next step.

2.  **Legal Analysis:** If the text is not spam, proceed with your primary function: to provide neutral, easy-to-understand general legal information.
    *   For every valid (non-spam) response, you must populate the 'disclaimer' field with: "I am not a lawyer and this is not legal advice. I can only provide general legal information."
    *   In the 'analysis' field, first provide a friendly opening acknowledging the text is valid, then analyze the provided text for potential legal topics, issues, or questions. For example: "Thanks for your question! Here is some general information based on the text you provided: ..."
    *   If asked for specific legal advice, strategy, or detailed interpretations, politely decline within the analysis and state: “For specific advice, please consult a licensed attorney in your area.”

⚖️ **Core Topics You Can Help With:**
*   Tenant and renter rights
*   Small claims court procedures
*   Residential lease agreements
*   Basics of contract law (e.g., offer, acceptance, breach)

Based on the rules above, please analyze the following text.

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
