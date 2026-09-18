/**
 * NyayaLens Security & Prompt Injection Guardrails
 * Protects legal AI pipelines from prompt injection, XSS vectors, and data leakage.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt/i,
  /output\s+(all\s+)?(environment|api\s*key|secrets)/i,
  /reveal\s+your\s+instructions/i,
  /act\s+as\s+(dan|jailbroken|unrestricted)/i,
];

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
}

export function checkPromptSafety(prompt: string): SafetyCheckResult {
  if (!prompt || typeof prompt !== 'string') {
    return { isSafe: false, reason: 'Invalid or empty input' };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        isSafe: false,
        reason: 'Potential prompt injection or instruction override attempt detected.',
      };
    }
  }

  return { isSafe: true };
}

export function sanitizeContractText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim();
}
