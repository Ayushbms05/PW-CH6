/**
 * Secure Content-Addressable Hashing Utility
 * Computes deterministic SHA-256 hash for prompt, schema, and system instruction.
 */

export async function computeContentHash(
  systemInstruction: string,
  prompt: string,
  schemaStr: string,
  task: 'light' | 'heavy'
): Promise<string> {
  const payload = `${systemInstruction.trim()}||${prompt.trim()}||${schemaStr.trim()}||${task}`;
  const msgUint8 = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
