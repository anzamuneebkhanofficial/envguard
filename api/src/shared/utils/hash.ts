import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

/**
 * Mask secret values according to EnvGuard spec:
 * <= 8 chars: ****
 * > 8 chars: First 4 characters + **** + Last 4 characters
 */
export function maskSecret(value: string): string {
  if (!value) return '****';
  const trimmed = value.trim();
  if (trimmed.length <= 8) {
    return '****';
  }
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-4);
  return `${prefix}****${suffix}`;
}

/**
 * Computes a short SHA-256 hash for auditing diffs without revealing content.
 */
export function computeFingerprint(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
}

/**
 * Hash password securely with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with stored hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
