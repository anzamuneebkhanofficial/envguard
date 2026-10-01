/**
 * Implements the Zero-Plaintext Masking Rule from design.md & PROJECT.md
 * <= 8 chars: ****
 * > 8 chars: First 4 chars + •••• + Last 4 chars
 */
export function maskValue(value?: string | null): string {
  if (!value) return '****';
  const trimmed = value.trim();
  if (trimmed.length <= 8) {
    return '****';
  }
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-4);
  return `${prefix}••••${suffix}`;
}
