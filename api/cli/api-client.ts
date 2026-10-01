import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { CLIConfigFile, ParsedVariable } from './types.js';

const CONFIG_DIR = path.join(os.homedir(), '.envguard');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function getStoredConfig(): CLIConfigFile {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data) as CLIConfigFile;
    }
  } catch {
    // Ignore config reading errors
  }
  return {};
}

export function saveStoredConfig(config: Partial<CLIConfigFile>): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const current = getStoredConfig();
    const updated = { ...current, ...config };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch {
    // Non-fatal
  }
}

export function resolveToken(explicitToken?: string): string {
  if (explicitToken && explicitToken.trim()) {
    return explicitToken.trim();
  }
  if (process.env.ENVGUARD_TOKEN && process.env.ENVGUARD_TOKEN.trim()) {
    return process.env.ENVGUARD_TOKEN.trim();
  }
  const config = getStoredConfig();
  if (config.token && config.token.trim()) {
    return config.token.trim();
  }
  throw new Error(
    'No authentication token provided. Pass --token, set ENVGUARD_TOKEN, or login.'
  );
}

export async function syncVariablesAPI(
  apiUrl: string,
  projectId: string,
  variables: ParsedVariable[],
  token: string
) {
  const normalizedUrl = apiUrl.replace(/\/+$/, '');
  const endpoint = `${normalizedUrl}/api/projects/${projectId}/variables/sync`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      variables,
      source: 'cli',
    }),
  });

  const body = (await response.json()) as { success: boolean; data?: unknown; error?: { message: string } };

  if (!response.ok || !body.success) {
    const message = body?.error?.message || `API request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body.data;
}

export async function fetchEnvExampleAPI(
  apiUrl: string,
  projectId: string,
  token: string
): Promise<string> {
  const normalizedUrl = apiUrl.replace(/\/+$/, '');
  const endpoint = `${normalizedUrl}/api/projects/${projectId}/env-example`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = (await response.json()) as { success: boolean; data?: { content: string }; error?: { message: string } };

  if (!response.ok || !body.success) {
    const message = body?.error?.message || `API request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body.data?.content || '';
}
