import Groq from 'groq-sdk';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const MAX_DOCUMENT_TEXT_LENGTH = 24000;

type ParsedDataUri = {
  mimeType: string;
  base64Data: string;
  buffer: Buffer;
};

function parseDataUri(dataUri: string): ParsedDataUri {
  const match = dataUri.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Unsupported file format. Please upload a PDF or image file.');
  }

  const [, mimeType, base64Data] = match;
  return {
    mimeType: mimeType.toLowerCase(),
    base64Data,
    buffer: Buffer.from(base64Data, 'base64'),
  };
}

function truncateDocumentText(text: string): string {
  if (text.length <= MAX_DOCUMENT_TEXT_LENGTH) {
    return text;
  }

  return `${text.slice(0, MAX_DOCUMENT_TEXT_LENGTH)}\n\n[Document text was truncated for analysis.]`;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text.trim();
}

async function extractImageText(dataUri: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is required to analyze image uploads.');
  }

  const client = new Groq({apiKey: process.env.GROQ_API_KEY});
  const response = await client.chat.completions.create({
    model: GROQ_VISION_MODEL,
    temperature: 0,
    max_completion_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all readable text from this legal document image. Preserve important labels, dates, names, amounts, addresses, deadlines, and court or lease details. Return only the extracted text.',
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUri,
            },
          },
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? '';
}

export async function extractTextFromDocumentDataUri(dataUri: string): Promise<string> {
  const {mimeType, buffer} = parseDataUri(dataUri);
  let text = '';

  if (mimeType === 'application/pdf') {
    text = await extractPdfText(buffer);
  } else if (mimeType.startsWith('image/')) {
    text = await extractImageText(dataUri);
  } else if (mimeType.startsWith('text/')) {
    text = buffer.toString('utf8').trim();
  } else {
    throw new Error('Unsupported file type. Please upload a PDF, image, or text file.');
  }

  if (!text) {
    throw new Error('No readable text could be extracted from this document.');
  }

  return truncateDocumentText(text);
}
