import { config } from 'dotenv';
config();

import '@/ai/flows/extract-lease-clauses.ts';
import '@/ai/flows/summarize-legal-information.ts';
import '@/ai/flows/analyze-text.ts';
import '@/ai/flows/answer-document-question.ts';
