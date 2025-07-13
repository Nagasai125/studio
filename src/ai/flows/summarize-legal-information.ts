'use server';

/**
 * @fileOverview A legal information summarization AI agent.
 *
 * - summarizeLegalInformation - A function that handles the legal information summarization process.
 * - SummarizeLegalInformationInput - The input type for the summarizeLegalInformation function.
 * - SummarizeLegalInformationOutput - The return type for the summarizeLegalInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLegalInformationInputSchema = z.object({
  legalQuestion: z.string().describe('The legal question to be summarized.'),
});
export type SummarizeLegalInformationInput = z.infer<typeof SummarizeLegalInformationInputSchema>;

const SummarizeLegalInformationOutputSchema = z.object({
  disclaimer: z.string().describe('A disclaimer stating that the information is not legal advice.'),
  summary: z.string().describe('A clear and concise summary of relevant legal information.'),
  resourceLinks: z.array(z.string()).describe('Links to official government resources for the topic.'),
});
export type SummarizeLegalInformationOutput = z.infer<typeof SummarizeLegalInformationOutputSchema>;

export async function summarizeLegalInformation(input: SummarizeLegalInformationInput): Promise<SummarizeLegalInformationOutput> {
  return summarizeLegalInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLegalInformationPrompt',
  input: {schema: SummarizeLegalInformationInputSchema},
  output: {schema: SummarizeLegalInformationOutputSchema},
  prompt: `You are CaseMate, a friendly and helpful U.S.-based AI assistant. Your goal is to provide neutral, easy-to-understand general legal information in a conversational way.

Start your response with a friendly greeting.

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
- Prioritize information relevant to U.S. federal law, and prefer state-specific laws if a state is mentioned.
- Maintain a friendly, informative, and neutral tone.
- Do not speculate, argue, or give opinions.
- Your goal is to inform, not advise—help users understand their rights and options, not what they should do.

Based on the rules above, please answer the following question. Provide a disclaimer, a summary, and links to official government resources.

Legal Question: {{{legalQuestion}}}`,
});

const summarizeLegalInformationFlow = ai.defineFlow(
  {
    name: 'summarizeLegalInformationFlow',
    inputSchema: SummarizeLegalInformationInputSchema,
    outputSchema: SummarizeLegalInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
