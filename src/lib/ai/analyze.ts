// Document analysis via Gemini structured outputs with resilient fallback
import { generateObject } from 'ai';
import { getGeminiModel } from './gemini';
import { DocumentAnalysisSchema } from './schemas';
import { DOCUMENT_ANALYSIS_PROMPT } from './prompts';
import { fallbackAnalyzeDocument } from './fallback';
import type { DocumentAnalysis } from '@/types';

export async function analyzeDocument(
  documentText: string,
  pageTexts: { pageNumber: number; text: string }[]
): Promise<DocumentAnalysis> {
  try {
    // Build document text with page markers
    const textWithPages = pageTexts
      .map(p => `--- PAGE ${p.pageNumber} ---\n${p.text}`)
      .join('\n\n');

    const prompt = DOCUMENT_ANALYSIS_PROMPT.replace('{documentText}', textWithPages || documentText);

    const { object } = await generateObject({
      model: getGeminiModel(),
      schema: DocumentAnalysisSchema,
      prompt,
      temperature: 0.2,
    });

    return object as DocumentAnalysis;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.warn('Gemini generateObject encountered an error, activating resilient analysis fallback:', errorMsg);
    return fallbackAnalyzeDocument(documentText, pageTexts);
  }
}
