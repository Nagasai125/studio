
'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting text from a document.
 *
 * - extractDocumentText - A function that handles extracting text from a document.
 * - ExtractDocumentTextInput - The input type for the extractDocumentText function.
 * - ExtractDocumentTextOutput - The return type for the extractDocumentText function.
 */

import {ai} from '@/ai/genkit';
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

const prompt = ai.definePrompt({
  name: 'extractDocumentTextPrompt',
  input: {schema: ExtractDocumentTextInputSchema},
  output: {schema: ExtractDocumentTextOutputSchema},
  prompt: `Extract all text from the following document and return it in the documentText field.

Document: {{media url=documentDataUri}}
`,
});

const extractDocumentTextFlow = ai.defineFlow(
  {
    name: 'extractDocumentTextFlow',
    inputSchema: ExtractDocumentTextInputSchema,
    outputSchema: ExtractDocumentTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function extractDocumentText(input: ExtractDocumentTextInput): Promise<ExtractDocumentTextOutput> {
  return extractDocumentTextFlow(input);
}
