
'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting key clauses from a lease agreement.
 *
 * - extractLeaseClauses - A function that handles the extraction of key clauses from a lease agreement.
 * - ExtractLeaseClausesInput - The input type for the extractLeaseClauses function.
 * - ExtractLeaseClausesOutput - The return type for the extractLeaseClauses function.
 */

import {ai} from '@/ai/genkit';
import {extractTextFromDocumentDataUri} from '@/ai/document-text';
import Groq from 'groq-sdk';
import {z} from 'genkit';

const GROQ_TEXT_MODEL = 'llama-3.3-70b-versatile';

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

async function analyzeDocumentText(documentText: string): Promise<ExtractLeaseClausesOutput> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is required to analyze document uploads.');
  }

  const client = new Groq({apiKey: process.env.GROQ_API_KEY});
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: GROQ_TEXT_MODEL,
        temperature: 0.1,
        max_completion_tokens: 2048,
        response_format: {type: 'json_object'},
        messages: [
          {
            role: 'user',
            content: `You are CaseMate, a helpful U.S.-based AI paralegal. Your task is a two-step process:

1.  **Spam Check:** First, examine the document to determine if it is a legitimate legal document (like a lease or traffic ticket) or if it's spam, irrelevant, or nonsensical.
    *   If it is spam, set 'isSpam' to true and provide a brief reason in 'spamReason'. In a new paragraph, also provide a few brief, general tips on how to identify and avoid this type of spam. Do not proceed further.
    *   If the document is a valid legal document, set 'isSpam' to false and continue to the next step.

2.  **Document Analysis:** If the document is not spam, proceed with your primary function.
    *   Begin the 'summary' with the disclaimer: "I am not a lawyer and this is not legal advice. I can only provide general legal information based on the document provided."
    *   Next, identify the type of document (e.g., "Residential Lease Agreement," "Uniform Traffic Citation").
    *   Then, extract and summarize the key information in a clear, easy-to-understand format. Use bullet points for clarity where appropriate.

        *   **If it's a lease:** Focus on key clauses like rent amount and due date, lease term, security deposit, maintenance responsibilities (who fixes what), and rules on pets or guests.
        *   **If it's a traffic violation:** Extract the following information and format it clearly. If a piece of information is not present, state that.
            *   **Violation:** What is the specific offense? (e.g., "Speeding")
            *   **Citation Number:** Find the citation or ticket number.
            *   **Date of Violation:** When did the violation occur?
            *   **Court Date and Time:** When and what time is the court appearance?
            *   **Court Location:** Provide the full address and phone number of the court.
            *   **Fine Amount:** Is there a fine amount listed? If not, state that the fine amount is not specified on the document.
            *   **Options:** What options are presented? (e.g., paying the fine, contesting the ticket, traffic school). Explain the notice about potential license suspension for failure to appear.

    *   Structure your summary logically. Present the most critical information first.

Analyze the following document based on these rules.

Return only a valid JSON object with this exact shape:
{
  "isSpam": false,
  "summary": "A clear document summary for the user."
}

If the document is spam or not a legal document, return:
{
  "isSpam": true,
  "spamReason": "A short explanation."
}

Do not return markdown. Do not return a JSON schema. Do not include keys like "type", "properties", "required", "description", or "$schema".

Document text:
"""
${documentText}
"""`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('The document analysis response was empty.');
      }

      return ExtractLeaseClausesOutputSchema.parse(JSON.parse(content));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

const extractLeaseClausesFlow = ai.defineFlow(
  {
    name: 'extractLeaseClausesFlow',
    inputSchema: ExtractLeaseClausesInputSchema,
    outputSchema: ExtractLeaseClausesOutputSchema,
  },
  async input => {
    const documentText = await extractTextFromDocumentDataUri(input.leaseAgreementDataUri);
    return analyzeDocumentText(documentText);
  }
);

export async function extractLeaseClauses(input: ExtractLeaseClausesInput): Promise<ExtractLeaseClausesOutput> {
  return extractLeaseClausesFlow(input);
}
