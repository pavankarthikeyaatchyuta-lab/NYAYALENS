// Chat logic for Nyaya AI
import { streamText } from 'ai';
import { getGeminiModel } from './gemini';
import { buildChatContext } from './prompts';
import type { ChatContext } from '@/types';

export function createChatStream(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context: ChatContext,
  onErrorCallback?: (err: Error) => void
) {
  const systemPrompt = buildChatContext({
    documentName: context.documentName,
    documentSummary: context.documentSummary,
    clauses: context.clauses,
    obligations: context.obligations,
    dates: context.dates,
    attentionAreas: context.attentionAreas,
    selectedClause: context.selectedClause,
  });

  return streamText({
    model: getGeminiModel(),
    system: systemPrompt,
    messages,
    temperature: 0.4,
    onError({ error }) {
      if (onErrorCallback) {
        onErrorCallback(error as Error);
      }
    },
  });
}
