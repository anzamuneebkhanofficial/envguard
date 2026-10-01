import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import type { ParsedVariable } from './types.js';

export function parseEnvFile(filePath: string): ParsedVariable[] {
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Environment file not found at path: ${resolvedPath}`);
  }

  const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
  const parsed = dotenv.parse(fileContent);

  const variables: ParsedVariable[] = [];

  for (const [key, value] of Object.entries(parsed)) {
    const trimmedKey = key.trim();
    if (!trimmedKey) continue;
    variables.push({
      key: trimmedKey,
      value: value ?? '',
    });
  }

  return variables;
}
