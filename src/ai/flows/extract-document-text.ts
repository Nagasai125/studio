
'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting text from a document.
 *
 * - extractDocumentText - A function that handles extracting text from a document.
 * - ExtractDocumentTextInput - The input type for the extractDocumentText function.
 * - ExtractDocumentTextOutput - The return type for the extractDocumentText function.
 */

import {ai} from '@/ai/genkit';
import {extractTextFromDocumentDataUri} from '@/ai/document-text';
import {z} from 'genkit';

const ExtractDocumentTextInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractDocumentTextInput = z.infer<typeof ExtractDocumentTextInputSchema>;

const ExtractDocumentTextOutputSchema = z.object({
  documentText: z.string().describe('The extracted text from the document.'),
});
export type ExtractDocumentTextOutput = z.infer<typeof ExtractDocumentTextOutputSchema>;

const extractDocumentTextFlow = ai.defineFlow(
  {
    name: 'extractDocumentTextFlow',
    inputSchema: ExtractDocumentTextInputSchema,
    outputSchema: ExtractDocumentTextOutputSchema,
  },
  async input => {
    return {
      documentText: await extractTextFromDocumentDataUri(input.documentDataUri),
    };
  }
);

export async function extractDocumentText(input: ExtractDocumentTextInput): Promise<ExtractDocumentTextOutput> {
  return extractDocumentTextFlow(input);
}
