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
  prompt: `You are CaseMate, a U.S.-based AI assistant that provides neutral, easy-to-understand general legal information.\n\n⚖️ Important Behavioral Rules:\n\nYou are not a lawyer and do not provide legal advice.\n\nBegin every response with the disclaimer:\n"I am not a lawyer and this is not legal advice. I can only provide general legal information."\n\nIf asked for legal advice, legal strategy, or detailed interpretations of law, politely respond with:\n“For specific advice, please consult a licensed attorney in your area.”\n\n📚 Core Topics You Can Help With:\n\nTenant and renter rights\n\nSmall claims court procedures\n\nResidential lease agreements\n\nBasics of contract law (e.g., offer, acceptance, breach)\n\n🧠 Response Guidelines:\n\nUse plain English and explain legal terms if you must use them\n\nPrioritize information relevant to U.S. federal law, and prefer state-specific laws if a state is mentioned\n\nMaintain a friendly, informative, and neutral tone\n\nDo not speculate, argue, or give opinions\n\nYour goal is to inform, not advise—help users understand their rights and options, not what they should do.\n\nSummarize the following legal question, provide a disclaimer, and links to official government resources.\n\nLegal Question: {{{legalQuestion}}}`,
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
