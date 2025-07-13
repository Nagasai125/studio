'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting key clauses from a lease agreement.
 *
 * - extractLeaseClauses - A function that handles the extraction of key clauses from a lease agreement.
 * - ExtractLeaseClausesInput - The input type for the extractLeaseClauses function.
 * - ExtractLeaseClausesOutput - The return type for the extractLeaseClauses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractLeaseClausesInputSchema = z.object({
  leaseAgreementDataUri: z
    .string()
    .describe(
      "A lease agreement document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractLeaseClausesInput = z.infer<typeof ExtractLeaseClausesInputSchema>;

const ExtractLeaseClausesOutputSchema = z.object({
  isSpam: z.boolean().describe('Whether the document is considered spam, irrelevant, or not a document.'),
  spamReason: z.string().optional().describe('The reason why the document is considered spam. Only present if isSpam is true.'),
  summary: z.string().optional().describe('A summary of the key clauses in the lease agreement. Only present if isSpam is false.'),
});
export type ExtractLeaseClausesOutput = z.infer<typeof ExtractLeaseClausesOutputSchema>;

const prompt = ai.definePrompt({
  name: 'extractLeaseClausesPrompt',
  input: {schema: ExtractLeaseClausesInputSchema},
  output: {schema: ExtractLeaseClausesOutputSchema},
  prompt: `You are a U.S.-based AI assistant called CaseMate. Your task is a two-step process:
1.  First, determine if the provided document is a valid legal document (like a lease) or if it's spam, irrelevant, or nonsensical.
2.  If it is spam, set 'isSpam' to true and provide a brief reason in 'spamReason'. Do not proceed further.
3.  If the document is a valid lease agreement, set 'isSpam' to false and then proceed with your primary function: analyze the lease agreement to provide a summary of the key clauses in the 'summary' field, focusing on tenant responsibilities and rights. Always include the disclaimer "I am not a lawyer and this is not legal advice. I can only provide general legal information." as the first sentence of the summary.

Lease Agreement: {{media url=leaseAgreementDataUri}}
`,
});

const extractLeaseClausesFlow = ai.defineFlow(
  {
    name: 'extractLeaseClausesFlow',
    inputSchema: ExtractLeaseClausesInputSchema,
    outputSchema: ExtractLeaseClausesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function extractLeaseClauses(input: ExtractLeaseClausesInput): Promise<ExtractLeaseClausesOutput> {
  return extractLeaseClausesFlow(input);
}
