
'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering follow-up questions about a document.
 *
 * - answerDocumentQuestion - A function that handles answering a user's question about a given document context.
 * - AnswerDocumentQuestionInput - The input type for the answerDocumentQuestion function.
 * - AnswerDocumentQuestionOutput - The return type for the answerDocumentQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerDocumentQuestionInputSchema = z.object({
  documentText: z.string().describe('The full text content of the document to be queried.'),
  question: z.string().describe('The user\'s follow-up question about the document.'),
});
export type AnswerDocumentQuestionInput = z.infer<typeof AnswerDocumentQuestionInputSchema>;

const AnswerDocumentQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question, based on the provided document context.'),
  disclaimer: z.string().describe('A disclaimer stating that the information is not legal advice.'),
});
export type AnswerDocumentQuestionOutput = z.infer<typeof AnswerDocumentQuestionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'answerDocumentQuestionPrompt',
  input: {schema: AnswerDocumentQuestionInputSchema},
  output: {schema: AnswerDocumentQuestionOutputSchema},
  prompt: `You are CaseMate, a helpful U.S.-based AI paralegal. Your task is to answer a user's question based *only* on the provided document text.

**Rules:**
1.  Your primary goal is to answer the user's question using the information found in the "Document Text" below.
2.  Begin your 'answer' with a friendly and direct response.
3.  If the answer to the question cannot be found in the document, you must state: "I cannot find the answer to that question in the document provided." Do not use outside knowledge.
4.  Always populate the 'disclaimer' field with: "I am not a lawyer and this is not legal advice. I can only provide general legal information based on the document provided."

**Document Text:**
"""
{{{documentText}}}
"""

**User's Question:**
"{{{question}}}"

Based on these rules, please answer the question.
`,
});

const answerDocumentQuestionFlow = ai.defineFlow(
  {
    name: 'answerDocumentQuestionFlow',
    inputSchema: AnswerDocumentQuestionInputSchema,
    outputSchema: AnswerDocumentQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function answerDocumentQuestion(input: AnswerDocumentQuestionInput): Promise<AnswerDocumentQuestionOutput> {
  return answerDocumentQuestionFlow(input);
}
