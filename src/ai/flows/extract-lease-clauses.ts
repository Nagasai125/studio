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
  summary: z.string().describe('A summary of the key clauses in the lease agreement.'),
});
export type ExtractLeaseClausesOutput = z.infer<typeof ExtractLeaseClausesOutputSchema>;

const prompt = ai.definePrompt({
  name: 'extractLeaseClausesPrompt',
  input: {schema: ExtractLeaseClausesInputSchema},
  output: {schema: ExtractLeaseClausesOutputSchema},
  prompt: `You are a U.S.-based AI assistant called CaseMate that provides neutral, easy-to-understand general legal information. I am not a lawyer and this is not legal advice. I can only provide general legal information. You will now analyze the following lease agreement to provide a summary of the key clauses, focusing on tenant responsibilities and rights.

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