
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
  prompt: `You are CaseMate, a helpful U.S.-based AI paralegal. Your task is a two-step process:

1.  **Spam Check:** First, examine the document to determine if it is a legitimate legal document (like a lease or traffic ticket) or if it's spam, irrelevant, or nonsensical.
    *   If it is spam, set 'isSpam' to true and provide a brief reason in 'spamReason'. In a new paragraph, also provide a few brief, general tips on how to identify and avoid this type of spam. Do not proceed further.
    *   If the document is a valid legal document, set 'isSpam' to false and continue to the next step.

2.  **Document Analysis:** If the document is not spam, proceed with your primary function.
    *   Begin the 'summary' with the disclaimer: "I am not a lawyer and this is not legal advice. I can only provide general legal information based on the document provided."
    *   Next, identify the type of document (e.g., "Residential Lease Agreement," "Traffic Violation Notice").
    *   Then, extract and summarize the key information in a clear, easy-to-understand format. Use bullet points for clarity where appropriate.
        *   **If it's a lease:** Focus on key clauses like rent amount and due date, lease term, security deposit, maintenance responsibilities (who fixes what), and rules on pets or guests.
        *   **If it's a traffic violation:** Explain the specific violation, the fine amount, the due date for payment, and any options presented (e.g., paying the fine, contesting the ticket, traffic school).
    *   Structure your summary logically. Present the most critical information first.

Analyze the following document based on these rules.

Document: {{media url=leaseAgreementDataUri}}
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
