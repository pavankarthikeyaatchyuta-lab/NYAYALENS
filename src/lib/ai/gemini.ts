// Gemini AI client setup via Vercel AI SDK
import { createGoogleGenerativeAI } from '@ai-sdk/google';

function getGeminiModel() {
  const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not set. Please add your Gemini API key to .env.local'
    );
  }

  const google = createGoogleGenerativeAI({
    apiKey,
  });

  return google(modelName);
}

export { getGeminiModel };
